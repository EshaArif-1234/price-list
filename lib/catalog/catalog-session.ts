/** Session keys for returning from product detail → catalog scroll position. */

export const CATALOG_LIST_PATH_KEY = "price_list_catalog_path_v1";
export const CATALOG_FOCUS_PRODUCT_ID_KEY = "price_list_catalog_focus_id_v1";

/** Call before navigating to `/products/[id]` so Back / return can restore list URL + scroll. */
export function rememberCatalogNavigationState(productId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    CATALOG_LIST_PATH_KEY,
    `${window.location.pathname}${window.location.search}`,
  );
  sessionStorage.setItem(CATALOG_FOCUS_PRODUCT_ID_KEY, productId);
}
