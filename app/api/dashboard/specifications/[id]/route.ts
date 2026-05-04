import { NextResponse } from "next/server";

import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import {
  deleteSpecification,
  listSpecifications,
  updateSpecification,
} from "@/lib/mongodb/repositories";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as unknown;
    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as { key?: string }).key !== "string" ||
      typeof (body as { value?: string }).value !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }
    const key = (body as { key: string }).key.trim();
    const value = (body as { value: string }).value.trim();
    if (!key.length || !value.length) {
      return NextResponse.json(
        { error: "Key and value are required." },
        { status: 400 },
      );
    }
    await updateSpecification({ id, key, value });
    const rows = await listSpecifications();
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
    await deleteSpecification(id);
    const rows = await listSpecifications();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
