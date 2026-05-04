"use client";

import { useEffect, useState } from "react";

import { CATEGORY_STORAGE_KEY } from "@/lib/dashboard/category-catalog";
import { dashboardGet } from "@/lib/dashboard/dashboard-fetch";
import {
  readDashboardOverviewCounts,
  type DashboardOverviewCounts,
} from "@/lib/dashboard/overview-stats";
import { PRODUCT_STORAGE_KEY } from "@/lib/dashboard/product-catalog";
import { SPECIFICATION_STORAGE_KEY } from "@/lib/dashboard/specification-catalog";
import { dashboardUsesMongoDb } from "@/lib/dashboard/storage-mode";

export function DashboardOverview() {
  const [counts, setCounts] = useState<DashboardOverviewCounts | null>(null);

  useEffect(() => {
    async function refreshMongo() {
      try {
        const c = await dashboardGet<DashboardOverviewCounts>(
          "/api/dashboard/overview",
        );
        setCounts(c);
      } catch {
        setCounts(null);
      }
    }

    function refreshLocal() {
      setCounts(
        readDashboardOverviewCounts({
          productsRaw: window.localStorage.getItem(PRODUCT_STORAGE_KEY),
          categoriesRaw: window.localStorage.getItem(CATEGORY_STORAGE_KEY),
          specificationsRaw:
            window.localStorage.getItem(SPECIFICATION_STORAGE_KEY),
        }),
      );
    }

    if (dashboardUsesMongoDb()) {
      void refreshMongo();
      return;
    }

    refreshLocal();
    window.addEventListener("storage", refreshLocal);
    return () => window.removeEventListener("storage", refreshLocal);
  }, []);

  const fmt = (n: number | null) =>
    n === null ? "—" : new Intl.NumberFormat().format(n);

  const statCard =
    "rounded-xl border border-secondary/12 bg-surface px-5 py-6 shadow-[0_1px_2px_rgba(15,76,105,0.06)]";

  return (
    <dl className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      <div className={statCard}>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
          Products
        </dt>
        <dd className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl">
          {fmt(counts?.products ?? null)}
        </dd>
      </div>
      <div className={statCard}>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
          Categories
        </dt>
        <dd className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-secondary sm:text-4xl">
          {fmt(counts?.categories ?? null)}
        </dd>
      </div>
      <div className={statCard}>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
          Specifications
        </dt>
        <dd className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-secondary sm:text-4xl">
          {fmt(counts?.specifications ?? null)}
        </dd>
      </div>
    </dl>
  );
}
