"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { logoutAction } from "@/app/actions/auth";
import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { CategoryMenu } from "@/components/layout/CategoryMenu";

type HeaderProps = {
  categories: string[];
  sessionEmail: string | null;
};

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const tokens = local.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (tokens.length === 0) return "A";
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function AdminMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = initialsFromEmail(email);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative self-end sm:self-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Admin account menu"
        title={email}
        className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full border border-secondary/15 bg-white py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
          {initials}
        </span>
        <ChevronIcon
          className={`size-4 shrink-0 text-secondary/55 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-muted bg-white py-1 shadow-lg ring-1 ring-black/[0.04]"
        >
          <p className="truncate border-b border-muted px-4 py-2.5 text-xs text-secondary/55">
            {email}
          </p>
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-muted/60"
          >
            <GridIcon className="size-[18px] text-secondary/55" />
            Dashboard
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogoutIcon className="size-[18px]" />
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

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

export function Header({ categories, sessionEmail }: HeaderProps) {
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

  const onLoginRoute = pathname === "/login";

  return (
    <header className="sticky top-0 z-40 shadow-md">
      <div className="border-b border-muted bg-surface">
        <CatalogWidth className="flex flex-col gap-3 py-3 sm:gap-6 sm:py-4 lg:gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="flex shrink-0 justify-center sm:justify-start"
            >
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

            <div className="flex min-w-0 w-full flex-col gap-3 sm:max-w-xl sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:gap-3 2xl:max-w-2xl">
              <div className="flex min-w-0 w-full flex-1 flex-col overflow-hidden rounded-[14px] border border-muted bg-white shadow-sm ring-1 ring-black/[0.04] min-[420px]:min-h-12 min-[420px]:flex-row min-[420px]:flex-nowrap min-[420px]:rounded-full lg:min-h-[3rem]">
                <label className="sr-only" htmlFor="catalog-search">
                  Search products
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  name="q"
                  autoComplete="off"
                  placeholder="Search products, categories, brands…"
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
                    <span className="sr-only">
                      Filter products by category
                    </span>
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

              {sessionEmail ? (
                <AdminMenu email={sessionEmail} />
              ) : (
                <Link
                  href="/login"
                  aria-current={onLoginRoute ? "page" : undefined}
                  className={`inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 sm:w-auto sm:min-w-[9.25rem] ${
                    onLoginRoute
                      ? "border-secondary bg-secondary text-white"
                      : "border-secondary text-secondary hover:bg-secondary hover:text-white"
                  }`}
                >
                  Admin login
                </Link>
              )}
            </div>
          </div>
        </CatalogWidth>
      </div>
    </header>
  );
}
