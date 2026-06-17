"use client";

import Link from "next/link";

import { BackToCatalogLink } from "@/components/catalog/BackToCatalogLink";

type ProductDetailBreadcrumbsProps = {
  productName: string;
};

export function ProductDetailBreadcrumbs({
  productName,
}: ProductDetailBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-secondary/45 sm:mb-6 sm:text-sm"
    >
      <Link href="/" className="transition-colors hover:text-secondary">
        Home
      </Link>
      <span aria-hidden className="text-secondary/30">
        /
      </span>
      <BackToCatalogLink className="transition-colors hover:text-secondary">
        Products
      </BackToCatalogLink>
      <span aria-hidden className="text-secondary/30">
        /
      </span>
      <span
        className="min-w-0 max-w-full truncate text-secondary/65"
        aria-current="page"
      >
        {productName}
      </span>
    </nav>
  );
}
