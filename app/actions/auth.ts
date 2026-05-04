"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  findAdminByEmail,
  verifyAdminPassword,
} from "@/lib/mongodb/admin-users-repository";

const SESSION_COOKIE = "dashboard_session";
const EMAIL_COOKIE = "dashboard_email";

const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};

/**
 * With `MONGODB_URI`, sign-in checks the `dashboard_admin_users` collection
 * (bcrypt password hashes). Without it, legacy demo mode accepts any credentials.
 */
export async function loginAction(formData: FormData) {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const cookieStore = await cookies();

  if (!process.env.MONGODB_URI?.trim()) {
    cookieStore.set(SESSION_COOKIE, "1", cookieOptions);
    cookieStore.set(
      EMAIL_COOKIE,
      emailRaw.length > 0 ? emailRaw : "admin@company.local",
      cookieOptions,
    );
    redirect("/dashboard");
  }

  let user;
  try {
    user = await findAdminByEmail(emailRaw);
  } catch (e) {
    console.error(e);
    redirect("/login?error=db");
  }

  if (
    !user ||
    !(await verifyAdminPassword(password, user.passwordHash))
  ) {
    redirect("/login?error=invalid");
  }

  cookieStore.set(SESSION_COOKIE, "1", cookieOptions);
  cookieStore.set(EMAIL_COOKIE, user.email, cookieOptions);
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(EMAIL_COOKIE);
  redirect("/login");
}
