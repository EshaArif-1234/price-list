import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto min-w-0 w-full max-w-5xl space-y-6 sm:space-y-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">
          Overview
        </h1>
      </div>

      <DashboardOverview />
    </div>
  );
}
