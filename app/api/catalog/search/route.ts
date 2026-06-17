import { NextResponse } from "next/server";

import { searchCatalogSuggestions } from "@/lib/catalog/search-suggestions";
import { getCatalogProducts } from "@/lib/catalog/server-catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const products = await getCatalogProducts();
    const results = searchCatalogSuggestions(products, q, 8);
    return NextResponse.json({ results });
  } catch (e) {
    console.error("[catalog/search]", e);
    return NextResponse.json({ results: [] });
  }
}
