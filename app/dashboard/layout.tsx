import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";

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
  if (cookieStore.get("dashboard_session")?.value !== "1") {
    redirect("/login");
  }

  const email =
    cookieStore.get("dashboard_email")?.value ?? "admin@company.local";

  return <DashboardShell userEmail={email}>{children}</DashboardShell>;
}
