/** In-stock counts at or below this value show as low (red) on catalog cards. */
export const LOW_STOCK_MAX = 10;

export type StockTone = "out" | "low" | "ok";

export function getStockDisplay(stock: number): { text: string; tone: StockTone } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= LOW_STOCK_MAX) return { text: `${stock} in stock`, tone: "low" };
  return { text: `${stock} in stock`, tone: "ok" };
}

export function getStockDetailText(stock: number): { text: string; tone: StockTone } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= LOW_STOCK_MAX) {
    return { text: `${stock} units in stock`, tone: "low" };
  }
  return { text: `${stock} units in stock`, tone: "ok" };
}
