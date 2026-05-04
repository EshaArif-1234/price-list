import { NextResponse } from "next/server";

import { normalizeProduct } from "@/lib/dashboard/product-catalog";
import { deleteProduct, replaceProduct } from "@/lib/mongodb/repositories";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as unknown;
    const merged =
      typeof body === "object" && body !== null
        ? { ...(body as Record<string, unknown>), id }
        : { id };
    const product = normalizeProduct(merged);
    if (!product || product.id !== id) {
      return NextResponse.json(
        { error: "Invalid product payload or id mismatch." },
        { status: 400 },
      );
    }
    await replaceProduct(product);
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    await deleteProduct(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
