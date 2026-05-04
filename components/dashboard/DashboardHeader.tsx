"use client";

import { logoutAction } from "@/app/actions/auth";

type DashboardHeaderProps = {
  userEmail: string;
  onMenuClick: () => void;
};

export function DashboardHeader({
  userEmail,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-3 border-b border-muted bg-surface pt-[env(safe-area-inset-top)] shadow-sm ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))] sm:min-h-16 sm:ps-5 sm:pe-5 xl:min-h-[4rem] xl:ps-6 xl:pe-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex size-11 items-center justify-center rounded-lg border border-muted text-secondary hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-secondary/55 xl:text-[13px]">
          Dashboard
        </p>
        <p className="truncate text-sm font-semibold text-secondary sm:text-base">
          Signed in as{" "}
          <span className="font-medium text-secondary/85">{userEmail}</span>
        </p>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-secondary px-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 sm:px-4"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
