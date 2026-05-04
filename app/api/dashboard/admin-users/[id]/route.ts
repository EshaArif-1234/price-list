import { NextResponse } from "next/server";

import {
  deleteAdminUser,
  listAdminUsersPublic,
  updateAdminUser,
} from "@/lib/mongodb/admin-users-repository";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      email?: string;
      password?: string;
    };
    await updateAdminUser(id, {
      email: body.email,
      password: body.password,
    });
    const list = await listAdminUsersPublic();
    return NextResponse.json(list);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update account.";
    if (
      message.includes("already") ||
      message.includes("Invalid") ||
      message.includes("at least") ||
      message.includes("not found")
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

export async function DELETE(_req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    await deleteAdminUser(id);
    const list = await listAdminUsersPublic();
    return NextResponse.json(list);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete account.";
    if (
      message.includes("last admin") ||
      message.includes("not found")
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
