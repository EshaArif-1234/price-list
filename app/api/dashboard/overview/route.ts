import { NextResponse } from "next/server";

import { listCategories, listProducts } from "@/lib/mongodb/repositories";

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      listProducts(),
      listCategories(),
    ]);
    return NextResponse.json({
      products: products.length,
      categories: categories.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
