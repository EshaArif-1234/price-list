"use client";

import Link from "next/link";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import {
  CATEGORY_LIST_PAGE_SIZE,
  CATEGORY_STORAGE_KEY,
} from "@/lib/dashboard/category-catalog";
import { dashboardGet, dashboardRequest } from "@/lib/dashboard/dashboard-fetch";

function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function loadRows(): DashboardCategoryRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is DashboardCategoryRow =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as DashboardCategoryRow).id === "string" &&
          typeof (row as DashboardCategoryRow).name === "string",
      )
      .map((row) => ({
        id: row.id,
        name: normalizeCategoryName(row.name),
      }))
      .filter((row) => row.name.length > 0);
  } catch {
    return [];
  }
}

function persistRows(rows: DashboardCategoryRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(rows));
}

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

function IconChevronLeft({ className }: { className?: string }) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
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

function IconAlertTriangle({ className }: { className?: string }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
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
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-secondary/[0.06]">
          <td className="px-4 py-4 lg:px-6">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-secondary/[0.08]" />
          </td>
          <td className="px-4 py-4 text-right lg:px-6">
            <div className="ml-auto h-10 w-24 animate-pulse rounded-lg bg-secondary/[0.06]" />
          </td>
        </tr>
      ))}
    </>
  );
}

function MobileRowSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="border-b border-secondary/[0.06] px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-secondary/[0.08]" />
            <div className="flex gap-1">
              <div className="size-11 animate-pulse rounded-lg bg-secondary/[0.06]" />
              <div className="size-11 animate-pulse rounded-lg bg-secondary/[0.06]" />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

export function CategoriesAdmin() {
  const [rows, setRows] = useState<DashboardCategoryRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  /** Categories survive in MongoDB via `/api/dashboard/categories` when the request succeeds. */
  const [persistBackend, setPersistBackend] = useState<"api" | "local">(
    "local",
  );
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<DashboardCategoryRow | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  const retryFetchFromServer = useCallback(async () => {
    setHydrated(false);
    try {
      const list = await dashboardGet<DashboardCategoryRow[]>(
        "/api/dashboard/categories",
      );
      setRows(list);
      setPersistBackend("api");
      setLoadWarning(null);
    } catch {
      setRows(loadRows());
      setPersistBackend("local");
      setLoadWarning(
        "Could not load categories from the server. Showing data stored in this browser instead.",
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    dashboardGet<DashboardCategoryRow[]>("/api/dashboard/categories")
      .then((list) => {
        if (!cancelled) {
          setRows(list);
          setPersistBackend("api");
          setLoadWarning(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRows(loadRows());
          setPersistBackend("local");
          setLoadWarning(
            "Could not load categories from the server. Showing data stored in this browser instead.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || persistBackend !== "local") return;
    persistRows(rows);
  }, [rows, hydrated, persistBackend]);

  useEffect(() => {
    const lockScroll = modalOpen || pendingDelete !== null;
    if (!lockScroll || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen, pendingDelete]);

  const pageSize = CATEGORY_LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (modalOpen && !d.open) {
      d.showModal();
      queueMicrotask(() => nameInputRef.current?.focus());
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

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const duplicateName = useCallback(
    (name: string, excludeId: string | null) => {
      const n = normalizeCategoryName(name).toLowerCase();
      return rows.some(
        (r) => r.id !== excludeId && r.name.toLowerCase() === n,
      );
    },
    [rows],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setNameInput("");
    setNameError(null);
  }, []);

  const openAdd = useCallback(() => {
    setPendingDelete(null);
    setEditingId(null);
    setNameInput("");
    setNameError(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: DashboardCategoryRow) => {
    setPendingDelete(null);
    setEditingId(row.id);
    setNameInput(row.name);
    setNameError(null);
    setModalOpen(true);
  }, []);

  const requestDelete = useCallback(
    (row: DashboardCategoryRow) => {
      closeModal();
      setPendingDelete(row);
    },
    [closeModal],
  );

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = normalizeCategoryName(nameInput);
    if (!name) {
      setNameError("Enter a category name.");
      return;
    }
    if (duplicateName(name, editingId)) {
      setNameError("A category with this name already exists.");
      return;
    }
    setNameError(null);

    if (persistBackend === "api") {
      try {
        if (editingId) {
          const next = await dashboardRequest<DashboardCategoryRow[]>(
            `/api/dashboard/categories/${editingId}`,
            { method: "PATCH", body: JSON.stringify({ name }) },
          );
          setRows(next);
        } else {
          const next = await dashboardRequest<DashboardCategoryRow[]>(
            "/api/dashboard/categories",
            {
              method: "POST",
              body: JSON.stringify({ id: crypto.randomUUID(), name }),
            },
          );
          setRows(next);
          const lastPage = Math.max(1, Math.ceil(next.length / pageSize));
          setPage(lastPage);
        }
        closeModal();
      } catch (err) {
        setNameError(
          err instanceof Error ? err.message : "Could not save category.",
        );
      }
      return;
    }

    if (editingId) {
      setRows((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, name } : r)),
      );
    } else {
      setRows((prev) => {
        const next = [...prev, { id: crypto.randomUUID(), name }];
        const lastPage = Math.max(1, Math.ceil(next.length / pageSize));
        setPage(lastPage);
        return next;
      });
    }
    closeModal();
  }

  const closeDeleteDialog = useCallback(() => {
    setPendingDelete(null);
  }, []);

  async function confirmDeleteCategory() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);

    if (persistBackend === "api") {
      try {
        const next = await dashboardRequest<DashboardCategoryRow[]>(
          `/api/dashboard/categories/${id}`,
          { method: "DELETE" },
        );
        setRows(next);
      } catch {
        setRows((prev) => prev.filter((r) => r.id !== id));
      }
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const rangeStart = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, rows.length);

  const touchFullSmAuto = "w-full min-[480px]:w-auto";

  const inputClass =
    "min-h-11 w-full rounded-xl border border-secondary/12 bg-white px-3.5 py-2.5 text-[15px] text-secondary outline-none ring-primary transition-[box-shadow,border-color] placeholder:text-secondary/35 focus-visible:border-transparent focus-visible:ring-2";

  const ghostBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white px-3.5 py-2.5 text-sm font-medium text-secondary/85 shadow-[0_1px_2px_rgba(15,76,105,0.04)] transition-[background-color,border-color,box-shadow,color] hover:border-secondary/22 hover:bg-secondary/[0.04] hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:min-h-10 sm:py-2";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(227,102,48,0.25)] transition-[filter,transform] hover:brightness-[1.03] active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const destructiveBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(220,38,38,0.28)] transition-[filter,transform] hover:bg-red-700 active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2";

  const iconEditBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-yellow-600 transition-[background-color,color] hover:bg-yellow-400/18 hover:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 lg:size-10";

  const iconDeleteBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-red-600 transition-[background-color,color] hover:bg-red-500/14 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 lg:size-10";

  const tableBlock = (
    <table className="w-full min-w-[28rem] table-fixed border-collapse text-left text-[14px]">
      <colgroup>
        <col />
        <col className="w-[8.5rem]" />
      </colgroup>
      <thead>
        <tr className="border-b border-secondary/[0.06] bg-secondary/[0.03]">
          <th
            scope="col"
            className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
          >
            Category
          </th>
          <th
            scope="col"
            className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
          >
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-secondary/[0.06]">
        {paginatedRows.map((row) => (
          <tr
            key={row.id}
            className="group bg-white transition-colors hover:bg-secondary/[0.02]"
          >
            <td className="px-4 py-4 align-middle lg:px-6">
              <span className="inline-flex max-w-full rounded-lg bg-secondary/[0.06] px-2.5 py-1 text-[13px] font-medium tracking-tight text-secondary">
                <span className="truncate">{row.name}</span>
              </span>
            </td>
            <td className="px-4 py-4 text-right align-middle lg:px-6">
              <div className="flex justify-end gap-0.5">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className={iconEditBtn}
                  aria-label={`Edit ${row.name}`}
                >
                  <IconPencil className="size-[18px] lg:size-[17px]" />
                </button>
                <button
                  type="button"
                  onClick={() => requestDelete(row)}
                  className={iconDeleteBtn}
                  aria-label={`Remove ${row.name}`}
                >
                  <IconTrash className="size-[18px] lg:size-[17px]" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

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
        <span className="font-medium text-secondary/70">Categories</span>
      </nav>

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/10 bg-secondary/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/55">
            <IconFolder className="size-3.5 shrink-0 opacity-70" />
            <span className="truncate">Catalog taxonomy</span>
          </div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-secondary sm:text-3xl">
            Categories
          </h1>
          <p className="text-[15px] leading-relaxed text-secondary/58">
            Create, edit, and delete categories used on products and filters.{" "}
            {persistBackend === "api"
              ? "Changes are saved to MongoDB."
              : loadWarning
                ? "Using browser-only storage until the server responds."
                : "Stored in this browser."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center lg:w-auto lg:justify-end">
          <div className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-secondary/10 bg-white px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,1)] min-[480px]:flex-none">
            <span className="text-[13px] text-secondary/45">Total</span>
            <span className="tabular-nums text-[15px] font-semibold text-secondary">
              {hydrated ? rows.length : "—"}
            </span>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className={`${primaryBtn} ${touchFullSmAuto}`}
          >
            <IconPlus className="size-[18px] opacity-95" />
            New category
          </button>
        </div>
      </header>

      {loadWarning ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-[13px] text-amber-950 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          role="status"
        >
          <p className="min-w-0 leading-relaxed">{loadWarning}</p>
          <button
            type="button"
            onClick={() => void retryFetchFromServer()}
            className={`${ghostBtn} shrink-0`}
          >
            Retry server
          </button>
        </div>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-xl border border-secondary/[0.09] bg-white shadow-[0_1px_3px_rgba(15,76,105,0.06),0_8px_24px_-8px_rgba(15,76,105,0.08)] sm:mt-10 sm:rounded-2xl">
        <div className="border-b border-secondary/[0.06] bg-secondary/[0.025] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-secondary">
              Category list
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-secondary/48">
              Names should match how you assign products (e.g. Safety,
              Equipment).
            </p>
          </div>
        </div>

        {!hydrated ? (
          <>
            <ul
              className="divide-y divide-secondary/[0.06] lg:hidden"
              aria-busy="true"
              aria-label="Loading categories"
            >
              <MobileRowSkeleton />
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[28rem] table-fixed border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-secondary/[0.06] bg-secondary/[0.03]">
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/[0.06]">
                  <TableSkeleton />
                </tbody>
              </table>
            </div>
          </>
        ) : paginatedRows.length === 0 ? (
          <div className="px-4 py-14 sm:px-6 sm:py-[4.5rem]">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/[0.04] text-secondary/35">
                <IconFolder className="size-7" />
              </div>
              <p className="mt-5 text-[15px] font-semibold text-secondary">
                No categories yet
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-secondary/48">
                Add a category to classify products in the catalog.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className={`${primaryBtn} ${touchFullSmAuto} mt-6 max-w-xs`}
              >
                <IconPlus className="size-[18px]" />
                New category
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-secondary/[0.06] lg:hidden">
              {paginatedRows.map((row) => (
                <li key={row.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 max-w-[min(100%,14rem)] rounded-lg bg-secondary/[0.06] px-2.5 py-1 text-[13px] font-medium text-secondary sm:max-w-[75%]">
                      <span className="truncate">{row.name}</span>
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className={iconEditBtn}
                        aria-label={`Edit ${row.name}`}
                      >
                        <IconPencil className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(row)}
                        className={iconDeleteBtn}
                        aria-label={`Remove ${row.name}`}
                      >
                        <IconTrash className="size-[18px]" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">{tableBlock}</div>
          </>
        )}

        {hydrated && rows.length > pageSize ? (
          <footer className="flex flex-col gap-4 border-t border-secondary/[0.06] bg-secondary/[0.02] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-[13px] text-secondary/48 sm:text-left">
              Showing{" "}
              <span className="font-semibold tabular-nums text-secondary">
                {rangeStart}
              </span>
              –
              <span className="font-semibold tabular-nums text-secondary">
                {rangeEnd}
              </span>
              <span className="text-secondary/40"> of </span>
              <span className="font-semibold tabular-nums text-secondary">
                {rows.length}
              </span>
            </p>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <span className="text-center text-[13px] text-secondary/48 sm:hidden">
                Page{" "}
                <span className="font-semibold text-secondary">{page}</span>
                <span className="text-secondary/35"> / </span>
                <span className="font-semibold text-secondary">{totalPages}</span>
              </span>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`${ghostBtn} min-h-11 px-3 sm:min-h-10`}
                >
                  <IconChevronLeft className="size-4 opacity-70" />
                  Previous
                </button>
                <span className="hidden min-w-[7rem] text-center text-[13px] text-secondary/48 sm:inline">
                  Page{" "}
                  <span className="font-semibold text-secondary">{page}</span>
                  <span className="text-secondary/35"> / </span>
                  <span className="font-semibold text-secondary">{totalPages}</span>
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`${ghostBtn} min-h-11 px-3 sm:min-h-10`}
                >
                  Next
                  <IconChevronRight className="size-4 opacity-70" />
                </button>
              </div>
            </div>
          </footer>
        ) : null}
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="category-modal-title"
        className="fixed left-1/2 top-1/2 z-[100] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-secondary/12 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(15,76,105,0.28)] backdrop:bg-secondary/35 backdrop:backdrop-blur-md sm:w-[min(440px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeModal();
        }}
      >
        <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />

          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4 sm:gap-4 sm:px-6 sm:pt-5">
            <div className="min-w-0 space-y-1 pr-1 sm:pr-2">
              <h2
                id="category-modal-title"
                className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
              >
                {editingId ? "Edit category" : "New category"}
              </h2>
              <p className="text-[13px] leading-relaxed text-secondary/52">
                Use the label shoppers see in filters and product assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 transition-[background-color,color,border-color] hover:border-secondary/12 hover:bg-secondary/[0.05] hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-10"
              aria-label="Close dialog"
            >
              <IconX className="size-[18px]" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-1 sm:px-6 sm:pt-3">
              <label
                htmlFor="category-name"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42"
              >
                Category name
              </label>
              <input
                ref={nameInputRef}
                id="category-name"
                name="name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError(null);
                }}
                placeholder="e.g. Safety"
                autoComplete="off"
                className={inputClass}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "category-name-error" : undefined}
              />
              {nameError ? (
                <p
                  id="category-name-error"
                  className="mt-2 text-[13px] font-medium text-red-700"
                  role="alert"
                >
                  {nameError}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] bg-secondary/[0.02] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:pb-4">
              <button
                type="button"
                onClick={closeModal}
                className={`${ghostBtn} ${touchFullSmAuto}`}
              >
                Cancel
              </button>
              <button type="submit" className={`${primaryBtn} ${touchFullSmAuto}`}>
                {editingId ? "Save changes" : "Create category"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-category-dialog-title"
        aria-describedby="delete-category-dialog-desc"
        className="fixed left-1/2 top-1/2 z-[105] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-red-200/80 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(185,28,28,0.22)] backdrop:bg-secondary/40 backdrop:backdrop-blur-md sm:w-[min(400px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeDeleteDialog();
        }}
      >
        <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />

          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
            <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-200/70 bg-red-50 text-red-600 sm:size-12"
                aria-hidden
              >
                <IconAlertTriangle className="size-6 sm:size-7" />
              </div>
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <h2
                  id="delete-category-dialog-title"
                  className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
                >
                  Remove category?
                </h2>
                <p
                  id="delete-category-dialog-desc"
                  className="text-[13px] leading-relaxed text-secondary/55"
                >
                  This label will be removed from the admin list. Existing
                  products keep any assignments to this name until you edit them.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeDeleteDialog}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 transition-[background-color,color,border-color] hover:border-secondary/12 hover:bg-secondary/[0.05] hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:size-10"
              aria-label="Close dialog"
            >
              <IconX className="size-[18px]" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 sm:px-6">
            {pendingDelete ? (
              <div className="mt-2 rounded-xl border border-secondary/[0.08] bg-secondary/[0.035] px-4 py-3 sm:mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                  Category
                </p>
                <p className="mt-1 break-words text-[15px] font-medium text-secondary">
                  {pendingDelete.name}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] bg-secondary/[0.02] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:pb-4">
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
              onClick={confirmDeleteCategory}
              className={`${destructiveBtn} ${touchFullSmAuto}`}
            >
              <IconTrash className="size-[17px] opacity-95" />
              Delete category
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
