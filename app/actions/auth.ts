"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "dashboard_session";
const EMAIL_COOKIE = "dashboard_email";

const cookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

/** Internal MVP: accepts any email/password and opens a dashboard session. */
export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "1", cookieOptions);
  cookieStore.set(
    EMAIL_COOKIE,
    email.length > 0 ? email : "admin@company.local",
    cookieOptions,
  );

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(EMAIL_COOKIE);
  redirect("/login");
}
