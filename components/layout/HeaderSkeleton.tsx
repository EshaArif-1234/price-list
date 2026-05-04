import { CatalogWidth } from "@/components/layout/CatalogWidth";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 shadow-md" aria-hidden>
      <div className="border-b border-muted bg-surface">
        <CatalogWidth className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4 lg:gap-8">
          <div className="flex w-full shrink-0 justify-center sm:w-auto sm:justify-start">
            <div className="h-11 w-44 animate-pulse rounded-md bg-muted min-[360px]:h-12 sm:h-14 lg:h-16 sm:w-48" />
          </div>
          <div className="min-w-0 w-full sm:flex sm:max-w-xl sm:flex-1 sm:justify-end 2xl:max-w-2xl">
            <div className="h-12 w-full animate-pulse rounded-[14px] bg-muted min-[420px]:rounded-full lg:h-[3rem]" />
          </div>
        </CatalogWidth>
      </div>
    </header>
  );
}
