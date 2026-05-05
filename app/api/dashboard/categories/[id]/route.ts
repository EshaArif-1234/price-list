import { NextResponse } from "next/server";

import type { DashboardCategoryRow, DeleteCategoryResponse } from "@/lib/dashboard/category-catalog";
import {
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/mongodb/repositories";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as unknown;
    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as { name?: string }).name !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }
    const name = (body as { name: string }).name.trim().replace(/\s+/g, " ");
    if (!name.length) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    await updateCategory({ id, name });
    const rows = await listCategories();
    return NextResponse.json(rows);
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
    const { deletedProductCount } = await deleteCategory(id);
    const categories = await listCategories();
    const body: DeleteCategoryResponse = {
      categories,
      deletedProductCount,
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    if (msg === "Category not found") {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
