import { NextResponse } from "next/server";

import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import {
  insertSpecification,
  listSpecifications,
} from "@/lib/mongodb/repositories";

export async function GET() {
  try {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as DashboardSpecificationRow).id !== "string" ||
      typeof (body as DashboardSpecificationRow).key !== "string" ||
      typeof (body as DashboardSpecificationRow).value !== "string"
    ) {
      return NextResponse.json({ error: "Invalid specification payload." }, { status: 400 });
    }
    const row = body as DashboardSpecificationRow;
    await insertSpecification({
      id: row.id.trim(),
      key: row.key.trim(),
      value: row.value.trim(),
    });
    const rows = await listSpecifications();
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Database error";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json(
        { error: "A specification with this id already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
