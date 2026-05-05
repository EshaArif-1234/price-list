"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { CATALOG_LIST_PATH_KEY } from "@/lib/catalog/catalog-session";

type BackToCatalogLinkProps = {
  className?: string;
  children: React.ReactNode;
};

/** Uses the stored catalog URL (pagination / filters) when returning from detail. */
export function BackToCatalogLink({
  className,
  children,
}: BackToCatalogLinkProps) {
  const [href, setHref] = useState("/");

  useEffect(() => {
    setHref(sessionStorage.getItem(CATALOG_LIST_PATH_KEY) ?? "/");
  }, []);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
