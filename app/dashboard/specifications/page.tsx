import { redirect } from "next/navigation";

/** Specifications are managed inline on each product — no separate page. */
export default function SpecificationsPage() {
  redirect("/dashboard/products");
}
