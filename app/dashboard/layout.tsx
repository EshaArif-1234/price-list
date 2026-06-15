import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard — Price List",
  description: "Internal admin dashboard for catalog management.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
  );
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell userEmail={session.email}>{children}</DashboardShell>
  );
}
