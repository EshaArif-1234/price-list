"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

import {
  CATALOG_FOCUS_PRODUCT_ID_KEY,
} from "@/lib/catalog/catalog-session";

function isCatalogListingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/client/product";
}

/**
 * After returning from a product detail page, scrolls the previously opened
 * card into view (best-effort). Clears the stored id once handled.
 */
export function CatalogScrollRestore() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!isCatalogListingPath(pathname)) return;

    const id = sessionStorage.getItem(CATALOG_FOCUS_PRODUCT_ID_KEY);
    if (!id) return;

    const run = () => {
      const el = document.getElementById(`catalog-product-${id}`);
      el?.scrollIntoView({ block: "center", behavior: "auto" });
      sessionStorage.removeItem(CATALOG_FOCUS_PRODUCT_ID_KEY);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [pathname]);

  return null;
}
