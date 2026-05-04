export default function DashboardProductsPage() {
  return (
    <div className="mx-auto min-w-0 w-full max-w-3xl space-y-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">
          Products
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary/75 sm:text-base">
          Product editing, imports, and bulk updates will live here. Data still
          comes from{" "}
          <code className="break-all rounded bg-muted px-1.5 py-0.5 text-xs sm:break-normal sm:text-sm">
            lib/data/products.ts
          </code>{" "}
          until a backend is connected.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-muted bg-surface px-4 py-10 text-center text-sm text-secondary/65 sm:px-6 sm:py-12">
        Admin product tools — coming next.
      </div>
    </div>
  );
}
