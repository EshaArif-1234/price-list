import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

/**
 * Returns a short-lived signature so the browser can upload an image straight to
 * Cloudinary. Keeping the file off the serverless function avoids Vercel's
 * ~4.5 MB request-body limit and function timeouts (the old proxy-through-the-API
 * approach failed with 502 on larger images). The API secret never leaves the server.
 *
 * The signature is computed directly with `node:crypto` instead of importing the
 * Cloudinary SDK, so this endpoint stays tiny and fast (no multi-hundred-KB SDK to
 * load on every cold start, which was making the first upload of a session slow).
 */

/**
 * Cloudinary signed-upload signature: SHA-1 hex of the signable params sorted by
 * key and joined as `k=v&k=v`, with the API secret appended (no separator).
 * This matches `cloudinary.utils.api_sign_request` with the default algorithm.
 */
function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}

/**
 * Reads an env var, trimming whitespace and stripping a single pair of wrapping
 * quotes. Pasting values into the Vercel dashboard with surrounding quotes is a
 * common mistake that silently corrupts the API secret and produces Cloudinary
 * "Invalid Signature" errors, so we defensively clean it here.
 */
function readEnv(name: string): string {
  const raw = process.env[name]?.trim() ?? "";
  return raw.replace(/^["'](.*)["']$/, "$1").trim();
}

function cloudinaryConfigured(): boolean {
  return Boolean(
    readEnv("CLOUDINARY_CLOUD_NAME") &&
      readEnv("CLOUDINARY_API_KEY") &&
      readEnv("CLOUDINARY_API_SECRET"),
  );
}

export async function POST() {
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the deployment environment.",
      },
      { status: 503 },
    );
  }

  const cloudName = readEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");
  const folder = readEnv("CLOUDINARY_UPLOAD_FOLDER") || "price-list-products";
  const timestamp = Math.round(Date.now() / 1000);

  try {
    // Only signable params are signed; api_key/file/signature are excluded by Cloudinary.
    const signature = signParams({ folder, timestamp }, apiSecret);

    return NextResponse.json({
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    });
  } catch (e) {
    console.error("[upload-signature]", e);
    return NextResponse.json(
      { error: "Could not prepare image upload." },
      { status: 500 },
    );
  }
}

/**
 * Safe credential diagnostic. Returns the cloud name, the API key, and a short
 * SHA-256 fingerprint of the secret (NOT the secret itself), so you can compare
 * local vs. live to confirm whether the deployed `CLOUDINARY_API_SECRET` differs
 * from the one that actually works. Open `/api/dashboard/upload-signature` in the
 * browser (while signed in) on both environments and compare `secretFingerprint`.
 */
export async function GET() {
  const cloudName = readEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");

  const secretFingerprint = apiSecret
    ? createHash("sha256").update(apiSecret).digest("hex").slice(0, 12)
    : null;

  return NextResponse.json({
    configured: cloudinaryConfigured(),
    cloudName: cloudName || null,
    apiKey: apiKey || null,
    apiKeyLength: apiKey.length,
    secretLength: apiSecret.length,
    secretFingerprint,
  });
}
