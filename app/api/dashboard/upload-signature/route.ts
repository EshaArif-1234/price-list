import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/**
 * Returns a short-lived signature so the browser can upload an image straight to
 * Cloudinary. Keeping the file off the serverless function avoids Vercel's
 * ~4.5 MB request-body limit and function timeouts (the old proxy-through-the-API
 * approach failed with 502 on larger images). The API secret never leaves the server.
 */

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
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret,
    );

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
