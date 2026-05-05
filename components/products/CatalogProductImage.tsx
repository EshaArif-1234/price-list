import Image from "next/image";

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

/** Avoid mixed-content blocks when DB has http Cloudinary URLs on an https site. */
function normalizeRemoteSrc(src: string): string {
  const t = src.trim();
  if (
    t.startsWith("http://res.cloudinary.com") ||
    t.startsWith("http://media.cloudinary.com")
  ) {
    return `https://${t.slice("http://".length)}`;
  }
  return t;
}

/**
 * Storefront images: `next/image` for paths under `public/` only.
 * Remote URLs (Cloudinary, etc.) and `data:` URLs use `<img>` so production
 * hosts are not blocked by the image optimizer or incomplete remotePatterns.
 */
export function CatalogProductImage({
  src,
  alt,
  fill,
  sizes,
  className,
  priority,
}: CatalogProductImageProps) {
  const raw = src.trim() || "/images/product-placeholder.svg";
  const normalized = normalizeRemoteSrc(raw);

  if (!isPublicAssetPath(normalized)) {
    const fillImgClass =
      fill === true
        ? ["absolute inset-0 h-full w-full object-cover", className]
            .filter(Boolean)
            .join(" ")
        : className;

    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional: reliable remote URLs on all hosts
      <img
        src={normalized}
        alt={alt}
        className={fillImgClass || undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  return (
    <Image
      src={normalized}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
