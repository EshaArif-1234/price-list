import { cache } from "react";

import { PRODUCTS, getCategories } from "@/lib/data/products";
import type { Product } from "@/lib/types/product";

let warnedVercelNoMongo = false;

function logCatalogConfig() {
  if (process.env.VERCEL !== "1" || warnedVercelNoMongo) return;
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    warnedVercelNoMongo = true;
    console.warn(
      "[catalog] Vercel: MONGODB_URI is not set. The public site will use static seed products (placeholder images), not your dashboard/MongoDB catalog.",
    );
  }
}

/** Products for the public catalog: MongoDB when configured, otherwise static seed. */
export const getCatalogProducts = cache(async (): Promise<Product[]> => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    logCatalogConfig();
    return PRODUCTS.filter((p) => p.active !== false);
  }

  try {
    const { listProducts } = await import("@/lib/mongodb/repositories");
    const products = await listProducts();
    if (process.env.CATALOG_DEBUG === "1") {
      const https = products.filter((p) =>
        /^https:\/\//i.test(p.image),
      ).length;
      console.log("[catalog] mongo products:", {
        count: products.length,
        httpsImageUrls: https,
      });
    }
    return products.filter((p) => p.active !== false);
  } catch (e) {
    console.error("[catalog] MongoDB unavailable:", e);
    return PRODUCTS.filter((p) => p.active !== false);
  }
});

/**
 * Category labels for the header filter: dashboard taxonomy (Mongo) plus any
 * labels used on products, merged and sorted.
 */
export const getCatalogCategories = cache(async (): Promise<string[]> => {
  const merged = new Set<string>();

  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    try {
      const { listCategories } = await import("@/lib/mongodb/repositories");
      const rows = await listCategories();
      for (const r of rows) merged.add(r.name);
    } catch {
      /* product-derived labels only */
    }
  }

  const products = await getCatalogProducts();
  for (const p of products) {
    for (const c of p.categories) merged.add(c);
  }

  if (merged.size === 0) return getCategories(PRODUCTS);

  return Array.from(merged).sort((a, b) => a.localeCompare(b));
});

export async function getCatalogProductById(
  id: string,
): Promise<Product | undefined> {
  const products = await getCatalogProducts();
  return products.find((p) => p.id === id);
}
