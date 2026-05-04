import { NextResponse } from "next/server";

import { normalizeProduct } from "@/lib/dashboard/product-catalog";
import { insertProduct, listProducts } from "@/lib/mongodb/repositories";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const product = normalizeProduct(body);
    if (!product) {
      return NextResponse.json({ error: "Invalid product payload." }, { status: 400 });
    }
    await insertProduct(product);
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Database error";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json(
        { error: "A product with this id already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
