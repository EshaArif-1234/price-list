"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/specifications", label: "Specifications" },
  { href: "/", label: "View catalog" },
];

function navActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/products") {
    return pathname.startsWith("/dashboard/products");
  }
  if (href === "/dashboard/specifications") {
    return pathname.startsWith("/dashboard/specifications");
  }
  return false;
}

type DashboardSidebarProps = {
  open: boolean;
  onNavigate?: () => void;
};

export function DashboardSidebar({ open, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-secondary/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onNavigate}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(17rem,88vw)] flex-col border-r border-white/10 bg-secondary pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-xl transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-60 lg:translate-x-0 lg:border-r lg:pt-0 lg:pb-0 lg:shadow-none xl:w-64 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-white/10 px-4 xl:h-16 xl:px-5">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="text-lg font-semibold tracking-tight text-white"
          >
            Price<span className="text-primary">List</span>
            <span className="ml-2 text-xs font-normal uppercase tracking-wider text-white/60">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3 xl:p-4" aria-label="Dashboard">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors xl:py-3 ${
                  active
                    ? "bg-primary text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 text-xs text-white/55 xl:p-4">
          Internal dashboard — authorized staff only.
        </div>
      </aside>
    </>
  );
}
