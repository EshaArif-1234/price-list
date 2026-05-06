"use client";

import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { dashboardGet, dashboardRequest } from "@/lib/dashboard/dashboard-fetch";
import {
  DEFAULT_ADMIN_EMAIL,
  type AdminUserPublic,
} from "@/lib/dashboard/admin-user-public";

function IconPlus({ className }: { className?: string }) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

export function AdminUsersAdmin() {
  const [rows, setRows] = useState<AdminUserPublic[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUserPublic | null>(
    null,
  );

  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      setLoadError(null);
      const list = await dashboardGet<AdminUserPublic[]>(
        "/api/dashboard/admin-users",
      );
      setRows(list);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load admin accounts.",
      );
      setRows([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (modalOpen && !d.open) {
      d.showModal();
      queueMicrotask(() => emailInputRef.current?.focus());
    } else if (!modalOpen && d.open) {
      d.close();
    }
  }, [modalOpen]);

  useEffect(() => {
    const d = deleteDialogRef.current;
    if (!d) return;
    if (pendingDelete && !d.open) {
      d.showModal();
      queueMicrotask(() => deleteCancelRef.current?.focus());
    } else if (!pendingDelete && d.open) {
      d.close();
    }
  }, [pendingDelete]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setEmailInput("");
    setPasswordInput("");
    setFormError(null);
  }, []);

  const openAdd = useCallback(() => {
    setPendingDelete(null);
    setEditingId(null);
    setEmailInput("");
    setPasswordInput("");
    setFormError(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: AdminUserPublic) => {
    setPendingDelete(null);
    setEditingId(row.id);
    setEmailInput(row.email);
    setPasswordInput("");
    setFormError(null);
    setModalOpen(true);
  }, []);

  const requestDelete = useCallback(
    (row: AdminUserPublic) => {
      closeModal();
      setPendingDelete(row);
    },
    [closeModal],
  );

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email.includes("@")) {
      setFormError("Enter a valid email.");
      return;
    }

    setFormError(null);

    try {
      if (editingId) {
        const body: { email: string; password?: string } = { email };
        if (password.length > 0) body.password = password;
        const next = await dashboardRequest<AdminUserPublic[]>(
          `/api/dashboard/admin-users/${editingId}`,
          { method: "PATCH", body: JSON.stringify(body) },
        );
        setRows(next ?? []);
      } else {
        if (password.length < 8) {
          setFormError("Password must be at least 8 characters.");
          return;
        }
        const next = await dashboardRequest<AdminUserPublic[]>(
          "/api/dashboard/admin-users",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          },
        );
        setRows(next ?? []);
      }
      closeModal();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save account.",
      );
    }
  }

  const closeDeleteDialog = useCallback(() => setPendingDelete(null), []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    try {
      const next = await dashboardRequest<AdminUserPublic[]>(
        `/api/dashboard/admin-users/${id}`,
        { method: "DELETE" },
      );
      setRows(next ?? []);
    } catch {
      await refresh();
    }
  }

  const touchFullSmAuto = "w-full min-[480px]:w-auto";

  const ghostBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white px-3.5 py-2.5 text-sm font-medium text-secondary/85 shadow-[0_1px_2px_rgba(15,76,105,0.04)] transition-[background-color,border-color,box-shadow,color] hover:border-secondary/22  hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-10 sm:py-2";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(227,102,48,0.25)] transition-[filter,transform] hover:brightness-[1.03] active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const destructiveBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(220,38,38,0.28)] transition-[filter,transform] hover:bg-red-700 active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2";

  const iconEditBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-yellow-600 transition-[background-color,color] hover:bg-yellow-400/18 hover:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 lg:size-10";

  const iconDeleteBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-red-600 transition-[background-color,color] hover:bg-red-500/14 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 lg:size-10";

  const inputClass =
    "min-h-11 w-full rounded-xl border border-secondary/12 bg-white px-3.5 py-2.5 text-[15px] text-secondary outline-none ring-primary transition-[box-shadow,border-color] placeholder:text-secondary/35 focus-visible:border-transparent focus-visible:ring-2";

  return (
    <div className="mx-auto min-w-0 w-full max-w-6xl pb-8 sm:pb-10">
      <nav
        className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-secondary/45 sm:mb-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/dashboard"
          className="min-h-11 min-w-0 font-medium transition-colors hover:text-secondary sm:min-h-0"
        >
          Dashboard
        </Link>
        <span aria-hidden className="text-secondary/30">
          /
        </span>
        <span className="font-medium text-secondary/70">Admin accounts</span>
      </nav>

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/10  px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/55">
            <IconShield className="size-3.5 shrink-0 opacity-70" />
            <span className="truncate">Dashboard sign-in</span>
          </div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-secondary sm:text-3xl">
            Admin accounts
          </h1>
          <p className="text-[15px] leading-relaxed text-secondary/58">
            Passwords are stored as hashes in MongoDB. If{" "}
            <span className="font-medium text-secondary">{DEFAULT_ADMIN_EMAIL}</span>{" "}
            is missing, it is created automatically the first time someone signs
            in or opens this page.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className={`${primaryBtn} ${touchFullSmAuto}`}
        >
          <IconPlus className="size-[18px] opacity-95" />
          New admin
        </button>
      </header>

      {loadError ? (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-xl border border-secondary/[0.09] bg-white shadow-[0_1px_3px_rgba(15,76,105,0.06)] sm:mt-10 sm:rounded-2xl">
        <div className="border-b border-secondary/[0.06] px-4 py-4 sm:px-6">
          <h2 className="text-[15px] font-semibold text-secondary">Accounts</h2>
          <p className="mt-0.5 text-[13px] text-secondary/48">
            {hydrated ? `${rows.length} administrator(s)` : "Loading…"}
          </p>
        </div>

        {!hydrated ? (
          <div className="px-4 py-12 text-center text-sm text-secondary/45 sm:px-6">
            Loading accounts…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-14 text-center sm:px-6">
            <p className="text-secondary/55">No accounts found.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-secondary/[0.06] lg:hidden">
              {rows.map((row) => (
                <li key={row.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[14px] font-medium text-secondary">
                      {row.email}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className={iconEditBtn}
                        aria-label={`Edit ${row.email}`}
                      >
                        <IconPencil className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(row)}
                        className={iconDeleteBtn}
                        aria-label={`Remove ${row.email}`}
                      >
                        <IconTrash className="size-[18px]" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[28rem] table-fixed border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-secondary/[0.06] ">
                    <th
                      scope="col"
                      className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="w-[8.5rem] px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/[0.06]">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-white transition-colors"
                    >
                      <td className="px-6 py-4 align-middle">
                        <span className="font-medium text-secondary">
                          {row.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right align-middle">
                        <div className="flex justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className={iconEditBtn}
                            aria-label={`Edit ${row.email}`}
                          >
                            <IconPencil className="size-[17px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(row)}
                            className={iconDeleteBtn}
                            aria-label={`Remove ${row.email}`}
                          >
                            <IconTrash className="size-[17px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="admin-user-modal-title"
        className="fixed left-1/2 top-1/2 z-[100] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-secondary/12 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(15,76,105,0.28)] backdrop:bg-secondary/35 backdrop:backdrop-blur-md sm:w-[min(440px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeModal();
        }}
      >
        <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
            <h2
              id="admin-user-modal-title"
              className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
            >
              {editingId ? "Edit admin" : "New admin"}
            </h2>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-10"
              aria-label="Close"
            >
              <IconX className="size-[18px]" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-2 pt-1 sm:px-6 sm:pt-3">
              <div>
                <label
                  htmlFor="admin-user-email"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42"
                >
                  Email
                </label>
                <input
                  ref={emailInputRef}
                  id="admin-user-email"
                  type="email"
                  autoComplete="off"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setFormError(null);
                  }}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="admin-user-password"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42"
                >
                  {editingId ? "New password (optional)" : "Password"}
                </label>
                <input
                  id="admin-user-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setFormError(null);
                  }}
                  placeholder={editingId ? "Leave blank to keep current" : "••••••••"}
                  className={inputClass}
                />
                {!editingId ? (
                  <p className="mt-1.5 text-[12px] text-secondary/48">
                    At least 8 characters.
                  </p>
                ) : null}
              </div>
              {formError ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-800"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] px-4 py-4 sm:flex-row sm:justify-end sm:gap-2 sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                className={`${ghostBtn} ${touchFullSmAuto}`}
              >
                Cancel
              </button>
              <button type="submit" className={`${primaryBtn} ${touchFullSmAuto}`}>
                {editingId ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-admin-title"
        className="fixed left-1/2 top-1/2 z-[105] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-red-200/80 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(185,28,28,0.22)] backdrop:bg-secondary/40 backdrop:backdrop-blur-md sm:w-[min(400px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeDeleteDialog();
        }}
      >
        <div className="flex flex-col p-6 sm:p-8">
          <h2
            id="delete-admin-title"
            className="text-lg font-semibold text-secondary"
          >
            Remove admin?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary/70">
            {pendingDelete ? (
              <>
                <span className="font-medium text-secondary">
                  {pendingDelete.email}
                </span>{" "}
                will no longer be able to sign in.
              </>
            ) : null}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={deleteCancelRef}
              type="button"
              onClick={closeDeleteDialog}
              className={`${ghostBtn} ${touchFullSmAuto}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              className={`${destructiveBtn} ${touchFullSmAuto}`}
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
