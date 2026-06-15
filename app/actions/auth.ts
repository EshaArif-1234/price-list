"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/session";
import {
  findAdminByEmail,
  verifyAdminPassword,
} from "@/lib/mongodb/admin-users-repository";

const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
  secure: process.env.NODE_ENV === "production",
};

async function startSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(email);
  cookieStore.set(SESSION_COOKIE, token, cookieOptions);
}

/**
 * With `MONGODB_URI`, sign-in checks the `dashboard_admin_users` collection
 * (bcrypt password hashes). Demo mode (accept-any-credentials) is only allowed
 * outside production, so a missing/blank URI in production never opens the
 * dashboard.
 */
export async function loginAction(formData: FormData) {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!process.env.MONGODB_URI?.trim()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[login] MONGODB_URI is not set in production.");
      redirect("/login?error=config");
    }
    await startSession(
      emailRaw.length > 0 ? emailRaw : "admin@company.local",
    );
    redirect("/dashboard");
  }

  let user;
  try {
    user = await findAdminByEmail(emailRaw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[login] MongoDB:", msg);
    redirect("/login?error=db");
  }

  if (!user || !(await verifyAdminPassword(password, user.passwordHash))) {
    redirect("/login?error=invalid");
  }

  await startSession(user.email);
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
