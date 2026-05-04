/** Locale-formatted price (PKR uses en-PK / Rs-style display). */
export function formatProductPrice(amount: number, currency: string): string {
  try {
    const locale = currency === "PKR" ? "en-PK" : undefined;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Public storefront: numeric amounts are always shown as Pakistani Rupees. */
export function formatCatalogPrice(amount: number): string {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount);
  } catch {
    return `${amount} PKR`;
  }
}
