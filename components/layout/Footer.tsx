import { CatalogWidth } from "@/components/layout/CatalogWidth";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-secondary py-6 text-white sm:py-8">
      <CatalogWidth className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-pretty text-white/95">
          Internal price list — employees only.
        </p>
        <p className="shrink-0 text-white/75">© {year} Company catalog</p>
      </CatalogWidth>
    </footer>
  );
}
