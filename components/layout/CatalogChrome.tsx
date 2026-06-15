"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeaderSkeleton } from "@/components/layout/HeaderSkeleton";

export function CatalogChrome({
  categories,
  sessionEmail,
  children,
}: {
  categories: string[];
  sessionEmail: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return children;
  }

  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header categories={categories} sessionEmail={sessionEmail} />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
