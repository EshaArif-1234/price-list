import type { Product, ProductBrand } from "@/lib/types/product";
import { PRODUCTS } from "@/lib/data/products";

export const PRODUCT_STORAGE_KEY = "dashboard_products_v1";

export const PRODUCT_LIST_PAGE_SIZE = 10;

export function productSeed(): Product[] {
  return PRODUCTS.map((p) => structuredClone(p));
}

function isBrand(v: unknown): v is ProductBrand {
  return v === "Ambassador" || v === "Imported";
}

function normalizeCategories(o: Record<string, unknown>): string[] {
  if (Array.isArray(o.categories)) {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of o.categories) {
      if (typeof item !== "string") continue;
      const t = item.trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out.length ? out : ["Uncategorized"];
  }
  const legacy =
    typeof o.category === "string" ? o.category.trim() : "";
  if (legacy) return [legacy];
  return ["Uncategorized"];
}

export function normalizeProduct(x: unknown): Product | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id.trim() : "";
  const name = typeof o.name === "string" ? o.name.trim() : "";
  if (!id || !name) return null;

  const categories = normalizeCategories(o);
  const description =
    typeof o.description === "string" ? o.description : "";
  let image =
    typeof o.image === "string" ? o.image.trim() : "";
  if (!image) {
    image = "/images/product-placeholder.svg";
  } else if (
    !image.startsWith("/") &&
    !/^https?:\/\//i.test(image) &&
    !image.startsWith("data:image/")
  ) {
    image = `/${image.replace(/^\/+/, "")}`;
  }
  const price =
    typeof o.price === "number" && Number.isFinite(o.price) ? o.price : 0;
  const currency =
    typeof o.currency === "string" && o.currency.trim()
      ? o.currency.trim()
      : "PKR";
  const stock =
    typeof o.stock === "number" && Number.isFinite(o.stock) && o.stock >= 0
      ? Math.floor(o.stock)
      : 0;
  const brand = isBrand(o.brand) ? o.brand : "Ambassador";

  let specifications: Product["specifications"] = [];
  if (Array.isArray(o.specifications)) {
    specifications = o.specifications
      .filter((s): s is { label: string; value: string } => {
        if (!s || typeof s !== "object") return false;
        const r = s as Record<string, unknown>;
        return (
          typeof r.label === "string" &&
          typeof r.value === "string" &&
          r.label.trim().length > 0 &&
          r.value.trim().length > 0
        );
      })
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));
  }

  return {
    id,
    name,
    categories,
    price,
    currency,
    description,
    image,
    stock,
    brand,
    specifications,
  };
}

export function parseStoredProducts(raw: string | null): Product[] {
  if (!raw) return productSeed();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return productSeed();
    const rows = parsed
      .map(normalizeProduct)
      .filter((p): p is Product => p !== null);
    return rows.length ? rows : productSeed();
  } catch {
    return productSeed();
  }
}
