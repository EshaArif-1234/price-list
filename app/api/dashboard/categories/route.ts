import { NextResponse } from "next/server";

import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import {
  insertCategory,
  listCategories,
} from "@/lib/mongodb/repositories";

export async function GET() {
  try {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as DashboardCategoryRow).id !== "string" ||
      typeof (body as DashboardCategoryRow).name !== "string"
    ) {
      return NextResponse.json({ error: "Invalid category payload." }, { status: 400 });
    }
    const row = body as DashboardCategoryRow;
    await insertCategory({
      id: row.id.trim(),
      name: row.name.trim().replace(/\s+/g, " "),
    });
    const rows = await listCategories();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Database error";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json(
        { error: "A category with this id already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
