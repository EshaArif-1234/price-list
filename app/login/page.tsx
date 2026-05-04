import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { CatalogWidth } from "@/components/layout/CatalogWidth";

export const metadata: Metadata = {
  title: "Admin login — Price List",
  description: "Internal administrator sign-in for the catalog dashboard.",
};

const LOGIN_ERRORS: Record<string, string> = {
  invalid: "Invalid email or password.",
  db: "Could not reach the database. Try again shortly.",
};

export default async function LoginRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  const loginError =
    q.error && LOGIN_ERRORS[q.error] ? LOGIN_ERRORS[q.error] : null;

  return (
    <CatalogWidth className="flex flex-1 flex-col justify-center px-3 py-10 sm:px-4 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-md rounded-xl border border-muted bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-8 border-l-4 border-primary pl-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary/60">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            Dashboard access is restricted to authorized administrators inside the
            company network.
          </p>
        </div>

        <LoginForm loginError={loginError} />

        <Link
          href="/"
          className="mt-8 flex min-h-11 items-center justify-center text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to catalog
        </Link>
      </div>
    </CatalogWidth>
  );
}
