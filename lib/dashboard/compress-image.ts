/**
 * Downscales and re-encodes an image in the browser before upload.
 *
 * Product images only ever render at a few hundred pixels, so uploading
 * multi-megapixel originals is slow and wasteful. This resizes to a sane max
 * dimension and re-encodes (WebP) so a 5 MB photo becomes a few hundred KB,
 * making uploads fast. Animated/vector formats are returned untouched.
 */

type CompressOptions = {
  /** Longest edge of the output, in pixels. */
  maxDimension?: number;
  /** 0–1 encoder quality. */
  quality?: number;
};

const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);

export async function compressImageFile(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;

  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/") || SKIP_TYPES.has(file.type)) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > maxDimension ? maxDimension / longest : 1;
    const targetW = Math.max(1, Math.round(bitmap.width * scale));
    const targetH = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    // Keep the original if encoding failed or didn't actually shrink it.
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}
