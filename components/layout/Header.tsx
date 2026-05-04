"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { CategoryMenu } from "@/components/layout/CategoryMenu";

type HeaderProps = {
  categories: string[];
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Header({ categories }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQ = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "all";

  const [searchValue, setSearchValue] = useState(urlQ);

  useEffect(() => {
    setSearchValue(urlQ);
  }, [urlQ]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...categories.map((c) => ({ value: c, label: c })),
    ],
    [categories],
  );

  function pushCatalogParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const q = next.q !== undefined ? next.q : (params.get("q") ?? "");
    const category =
      next.category !== undefined
        ? next.category
        : (params.get("category") ?? "all");

    if (q) params.set("q", q);
    else params.delete("q");

    if (category && category !== "all") params.set("category", category);
    else params.delete("category");

    params.delete("page");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function applyFiltersFromCatalog() {
    pushCatalogParams({ q: searchValue, category: urlCategory });
  }

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="border-b border-muted bg-surface">
        <CatalogWidth className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4 lg:gap-8">
          <Link href="/" className="flex w-full shrink-0 justify-center sm:w-auto sm:justify-start">
            <Image
              src="/images/ambassador.webp"
              alt="Ambassador — Commercial Kitchen Equipment"
              width={220}
              height={72}
              sizes="(max-width: 380px) 160px, (max-width: 640px) 200px, 220px"
              className="h-11 w-auto object-contain object-center sm:object-left min-[360px]:h-12 sm:h-14 lg:h-16"
              priority
            />
          </Link>

          <div className="min-w-0 w-full sm:flex sm:max-w-xl sm:flex-1 sm:justify-end 2xl:max-w-2xl">
            <div className="flex w-full flex-col overflow-hidden rounded-[14px] border border-muted bg-white shadow-sm ring-1 ring-black/[0.04] min-[420px]:min-h-12 min-[420px]:flex-row min-[420px]:flex-nowrap min-[420px]:rounded-full lg:min-h-[3rem]">
              <label className="sr-only" htmlFor="catalog-search">
                Search products
              </label>
              <input
                id="catalog-search"
                type="search"
                name="q"
                autoComplete="off"
                placeholder="Search for products"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyFiltersFromCatalog();
                  }
                }}
                className="min-h-12 w-full min-w-0 border-0 border-b border-muted bg-transparent px-3 py-3 text-[15px] leading-snug text-secondary placeholder:text-secondary/45 outline-none min-[420px]:min-h-12 min-[420px]:flex-1 min-[420px]:border-b-0 min-[420px]:border-r min-[420px]:text-sm sm:min-h-[3rem] sm:pl-5 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
              />

              <div className="flex min-h-12 w-full min-w-0 min-[420px]:w-auto min-[420px]:shrink-0 sm:min-h-[3rem]">
                <div className="flex min-h-full min-w-0 flex-1 items-stretch border-muted bg-white min-[420px]:border-l">
                  <span className="sr-only">Category filter</span>
                  <CategoryMenu
                    value={urlCategory === "" ? "all" : urlCategory}
                    options={categoryOptions}
                    disabled={isPending}
                    onChange={(nextCat) =>
                      pushCatalogParams({
                        category: nextCat,
                        q: searchValue,
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => applyFiltersFromCatalog()}
                  className="flex min-h-12 min-w-12 shrink-0 items-center justify-center bg-primary px-4 text-white transition-colors hover:bg-primary/90 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-white/40 disabled:opacity-60 min-[420px]:min-h-full min-[420px]:min-w-[3rem] sm:min-h-[3rem] sm:min-w-[3.25rem]"
                  disabled={isPending}
                  aria-label="Search"
                >
                  <SearchIcon className="size-[1.125rem] min-[420px]:size-5" />
                </button>
              </div>
            </div>
          </div>
        </CatalogWidth>
      </div>
    </header>
  );
}
