/**
 * Stateless, signed dashboard session.
 *
 * The cookie holds `base64url(payload).base64url(HMAC-SHA256(payload))`, signed
 * with `SESSION_SECRET`. Tampering invalidates the signature, so a forged cookie
 * (e.g. the old static `"1"` value) is rejected. Uses Web Crypto so the same
 * code runs in the Node server actions and the Edge proxy/middleware.
 */

export const SESSION_COOKIE = "dashboard_session";

/** One day, matching the cookie `maxAge`. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24;

export type SessionPayload = {
  email: string;
  /** Expiry as a UNIX timestamp in seconds. */
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded =
    value.length % 4 === 0
      ? value
      : value + "=".repeat(4 - (value.length % 4));
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a random value of at least 32 characters in your environment.",
    );
  }
  return secret;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  email: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64),
  );
  return `${payloadB64}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Returns the payload when the token signature is valid and unexpired, else null. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return null;

  let key: CryptoKey;
  try {
    key = await importKey(getSecret());
  } catch {
    return null;
  }

  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureB64),
      encoder.encode(payloadB64),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(
      decoder.decode(base64UrlDecode(payloadB64)),
    ) as SessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number" ||
    payload.exp * 1000 <= Date.now()
  ) {
    return null;
  }

  return payload;
}
