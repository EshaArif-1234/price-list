import { CatalogWidth } from "@/components/layout/CatalogWidth";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 shadow-md" aria-hidden>
      <div className="border-b border-muted bg-surface">
        <CatalogWidth className="flex flex-col gap-3 py-3 sm:gap-6 sm:py-4 lg:gap-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex shrink-0 justify-center sm:justify-start">
              <div className="h-11 w-44 animate-pulse rounded-md bg-muted min-[360px]:h-12 sm:h-14 sm:w-48 lg:h-16" />
            </div>
            <div className="flex min-w-0 w-full flex-col gap-3 sm:max-w-xl sm:flex-1 sm:flex-row sm:items-center sm:justify-end sm:gap-3 2xl:max-w-2xl">
              <div className="h-12 w-full min-w-0 flex-1 animate-pulse rounded-[14px] bg-muted min-[420px]:rounded-full lg:h-[3rem]" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-muted sm:w-[9.25rem] sm:shrink-0" />
            </div>
          </div>
        </CatalogWidth>
      </div>
    </header>
  );
}
