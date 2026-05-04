"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeaderSkeleton } from "@/components/layout/HeaderSkeleton";

export function CatalogChrome({
  categories,
  children,
}: {
  categories: string[];
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
        <Header categories={categories} />
      </Suspense>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
