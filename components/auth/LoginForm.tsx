"use client";

import { useFormStatus } from "react-dom";
import { useId, useState } from "react";

import { loginAction } from "@/app/actions/auth";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full rounded-lg bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in to dashboard"}
    </button>
  );
}

export function LoginForm() {
  const passwordFieldId = useId();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={loginAction} className="flex w-full flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-email"
          className="text-sm font-medium text-secondary"
        >
          Work email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@company.com"
          className="min-h-12 w-full rounded-lg border border-muted bg-white px-4 py-3 text-secondary outline-none ring-primary transition-shadow placeholder:text-secondary/40 focus-visible:border-transparent focus-visible:ring-2"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordFieldId}
          className="text-sm font-medium text-secondary"
        >
          Password
        </label>
        <div className="relative">
          <input
            id={passwordFieldId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="min-h-12 w-full rounded-lg border border-muted bg-white py-3 pl-4 pr-12 text-secondary outline-none ring-primary transition-shadow placeholder:text-secondary/40 focus-visible:border-transparent focus-visible:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-secondary/55 transition-colors hover:bg-muted hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOffIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <SubmitButton />

      <p className="text-center text-xs leading-relaxed text-secondary/55">
        Demo mode: any email and password grant admin access within your browser
        session. Replace with company SSO or credentials when ready.
      </p>
    </form>
  );
}
