import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";

import { CatalogChrome } from "@/components/layout/CatalogChrome";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { getCatalogCategories } from "@/lib/catalog/server-catalog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Price List — Internal catalog",
  description: "Company product catalog and pricing for employees.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const categories = await getCatalogCategories();
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value,
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-surface font-sans text-secondary">
        <CatalogChrome categories={categories} sessionEmail={session?.email ?? null}>
          {children}
        </CatalogChrome>
      </body>
    </html>
  );
}
