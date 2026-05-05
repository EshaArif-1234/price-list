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

    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional: reliable remote URLs on all hosts
      <img
        src={effective}
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
