import { NextResponse } from "next/server";

import {
  listCategories,
  listProducts,
  listSpecifications,
} from "@/lib/mongodb/repositories";

export async function GET() {
  try {
    const [products, categories, specifications] = await Promise.all([
      listProducts(),
      listCategories(),
      listSpecifications(),
    ]);
    return NextResponse.json({
      products: products.length,
      categories: categories.length,
      specifications: specifications.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
