"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/images/product-placeholder.svg";

type CatalogProductImageProps = {
  src: string;
  alt: string;
  /** Layout fill inside a `relative` parent */
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /**
   * Target display width in CSS pixels. Used to ask Cloudinary for a correctly
   * sized, optimized image (plus a 2x variant for retina), so cards stay crisp
   * without downloading the full-resolution upload.
   */
  width?: number;
};

function isPublicAssetPath(src: string): boolean {
  const t = src.trim();
  return t.startsWith("/") && !t.startsWith("//");
}

/** HTTPS site + http image URLs → mixed content blocked by the browser */
function normalizeRemoteSrc(src: string): string {
  const t = src.trim();
  if (/^http:\/\/[\w.-]*cloudinary\.com/i.test(t)) {
    return `https://${t.slice("http://".length)}`;
  }
  return t;
}

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

function isCloudinaryUrl(url: string): boolean {
  return /res\.cloudinary\.com\/.+\/image\/upload\//i.test(url);
}

/**
 * Inserts Cloudinary delivery transformations after `/image/upload/`:
 * `f_auto` (serve AVIF/WebP), `q_auto` (auto quality), `c_limit,w_*` (never
 * upscale past the requested width). This makes images noticeably sharper and
 * smaller than serving the raw uploaded file. Returns the URL unchanged if it
 * already carries transformations.
 */
function optimizeCloudinarySrc(url: string, width?: number): string {
  const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (idx === -1) return url;

  const after = url.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);
  // Skip if a transformation segment is already present (anything before the version/public id).
  if (/^[a-z]{1,3}_[^/]+\//i.test(after)) return url;

  const params = ["f_auto", "q_auto", "c_limit"];
  if (width && Number.isFinite(width)) params.push(`w_${Math.round(width)}`);
  return (
    url.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length) +
    params.join(",") +
    "/" +
    after
  );
}

/**
 * Storefront images: `next/image` for paths under `public/` only.
 * Remote URLs use `<img>` so production does not depend on the image optimizer.
 * Failed loads fall back to the placeholder (broken URLs, DB fallback catalog, etc.).
 */
export function CatalogProductImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
  width,
}: CatalogProductImageProps) {
  const [broken, setBroken] = useState(false);

  const raw = src.trim() || PLACEHOLDER;
  const normalized = normalizeRemoteSrc(raw);

  useEffect(() => {
    setBroken(false);
  }, [src]);

  const effective = broken ? PLACEHOLDER : normalized;

  if (!isPublicAssetPath(effective)) {
    const fillImgClass =
      fill === true
        ? ["absolute inset-0 h-full w-full object-cover", className]
            .filter(Boolean)
            .join(" ")
        : className;

    const cloudinary = isCloudinaryUrl(effective);
    const imgSrc = cloudinary
      ? optimizeCloudinarySrc(effective, width)
      : effective;
    const imgSrcSet =
      cloudinary && width
        ? `${optimizeCloudinarySrc(effective, width)} 1x, ${optimizeCloudinarySrc(
            effective,
            width * 2,
          )} 2x`
        : undefined;

    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional: reliable remote URLs on all hosts
      <img
        src={imgSrc}
        srcSet={imgSrcSet}
        alt={alt}
        className={fillImgClass || undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Image
      src={effective}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setBroken(true)}
    />
  );
}
