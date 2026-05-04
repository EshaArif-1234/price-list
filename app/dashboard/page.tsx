import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto min-w-0 w-full max-w-5xl space-y-6 sm:space-y-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">
          Overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary/75 sm:text-base">
          Welcome to the internal admin dashboard. Use the sidebar to manage
          catalog content or open the public price list.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <Link
          href="/dashboard/products"
          className="min-h-[4.5rem] rounded-xl border border-muted bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:min-h-0 sm:p-5"
        >
          <h2 className="font-semibold text-secondary">Products</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            Review SKUs, stock levels, and pricing
          </p>
        </Link>

        <Link
          href="/dashboard/specifications"
          className="min-h-[4.5rem] rounded-xl border border-muted bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:min-h-0 sm:p-5"
        >
          <h2 className="font-semibold text-secondary">Specifications</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            Add and edit specification keys and values for listings
          </p>
        </Link>

        <Link
          href="/"
          className="min-h-[4.5rem] rounded-xl border border-muted bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:min-h-0 sm:p-5"
        >
          <h2 className="font-semibold text-secondary">Public catalog</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            See what employees see on the storefront
          </p>
        </Link>

        <div className="min-h-[4.5rem] rounded-xl border border-dashed border-muted bg-muted/30 p-4 opacity-75 sm:min-h-0 sm:p-5">
          <h2 className="font-semibold text-secondary">Reports</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            Exports and summaries — coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
