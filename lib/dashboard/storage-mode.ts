/** Client-side toggle: when true, dashboard reads/writes via `/api/dashboard/*` (MongoDB). */
export function dashboardUsesMongoDb(): boolean {
  return process.env.NEXT_PUBLIC_DASHBOARD_USE_MONGO === "true";
}
