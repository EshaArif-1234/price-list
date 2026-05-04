import { NextResponse } from "next/server";

import {
  createAdminUser,
  listAdminUsersPublic,
} from "@/lib/mongodb/admin-users-repository";

export async function GET() {
  try {
    const users = await listAdminUsersPublic();
    return NextResponse.json(users);
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
    const body = (await req.json()) as { email?: string; password?: string };
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    await createAdminUser(email, password);
    const list = await listAdminUsersPublic();
    return NextResponse.json(list);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create account.";
    if (
      message.includes("already") ||
      message.includes("Invalid") ||
      message.includes("at least")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json(
      { error: "Database unavailable. Set MONGODB_URI in .env.local." },
      { status: 503 },
    );
  }
}
