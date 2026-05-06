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

import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import {
  SPECIFICATION_LIST_PAGE_SIZE,
  SPECIFICATION_STORAGE_KEY,
} from "@/lib/dashboard/specification-catalog";
import { dashboardGet, dashboardRequest } from "@/lib/dashboard/dashboard-fetch";
import { dashboardUsesMongoDb } from "@/lib/dashboard/storage-mode";

function loadRows(): DashboardSpecificationRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SPECIFICATION_STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is DashboardSpecificationRow =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as DashboardSpecificationRow).id === "string" &&
          typeof (row as DashboardSpecificationRow).key === "string" &&
          typeof (row as DashboardSpecificationRow).value === "string",
      )
      .map((row) => ({
        id: row.id,
        key: row.key.trim(),
        value: row.value.trim(),
      }))
      .filter((row) => row.key.length > 0);
  } catch {
    return [];
  }
}

function persistRows(rows: DashboardSpecificationRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SPECIFICATION_STORAGE_KEY, JSON.stringify(rows));
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

function IconLayers({ className }: { className?: string }) {
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
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.05 4.13a2 2 0 0 1-1.9 0L2 17.65" />
      <path d="m22 12.65-9.05 4.13a2 2 0 0 1-1.9 0L2 12.65" />
    </svg>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-secondary/[0.06]">
          <td className="px-4 py-4 lg:px-6">
            <div className="h-6 w-36 animate-pulse rounded-md " />
          </td>
          <td className="px-4 py-4 text-right lg:px-6">
            <div className="ml-auto h-10 w-24 animate-pulse rounded-lg" />
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
        <li
          key={i}
          className="border-b border-secondary/[0.06] px-4 py-4 sm:px-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-7 w-28 animate-pulse rounded-lg" />
            <div className="flex gap-1">
              <div className="size-11 animate-pulse rounded-lg sm:size-10" />
              <div className="size-11 animate-pulse rounded-lg sm:size-10" />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

export function SpecificationsAdmin() {
  const [rows, setRows] = useState<DashboardSpecificationRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [pendingDelete, setPendingDelete] =
    useState<DashboardSpecificationRow | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dashboardUsesMongoDb()) {
      let cancelled = false;
      dashboardGet<DashboardSpecificationRow[]>("/api/dashboard/specifications")
        .then((list) => {
          if (!cancelled) setRows(list);
        })
        .catch(() => {
          if (!cancelled) setRows([]);
        })
        .finally(() => {
          if (!cancelled) setHydrated(true);
        });
      return () => {
        cancelled = true;
      };
    }

    setRows(loadRows());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || dashboardUsesMongoDb()) return;
    persistRows(rows);
  }, [rows, hydrated]);

  const pageSize = SPECIFICATION_LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (modalOpen && !d.open) {
      d.showModal();
      queueMicrotask(() => keyInputRef.current?.focus());
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

  const openAdd = useCallback(() => {
    setPendingDelete(null);
    setEditingId(null);
    setKeyInput("");
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: DashboardSpecificationRow) => {
    setPendingDelete(null);
    setEditingId(row.id);
    setKeyInput(row.key);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setKeyInput("");
  }, []);

  const requestDelete = useCallback(
    (row: DashboardSpecificationRow) => {
      closeModal();
      setPendingDelete(row);
    },
    [closeModal],
  );

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const key = keyInput.trim();
    if (!key) return;

    const existingRow = editingId
      ? rows.find((r) => r.id === editingId)
      : null;
    const value = existingRow?.value?.trim() ?? "";

    if (dashboardUsesMongoDb()) {
      try {
        if (editingId) {
          const next = await dashboardRequest<DashboardSpecificationRow[]>(
            `/api/dashboard/specifications/${editingId}`,
            { method: "PATCH", body: JSON.stringify({ key, value }) },
          );
          setRows(next);
        } else {
          const next = await dashboardRequest<DashboardSpecificationRow[]>(
            "/api/dashboard/specifications",
            {
              method: "POST",
              body: JSON.stringify({
                id: crypto.randomUUID(),
                key,
                value: "",
              }),
            },
          );
          setRows(next);
          const lastPage = Math.max(1, Math.ceil(next.length / pageSize));
          setPage(lastPage);
        }
        closeModal();
      } catch {
        /* keep modal open; optional: toast */
      }
      return;
    }

    if (editingId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, key, value: r.value } : r,
        ),
      );
    } else {
      setRows((prev) => {
        const next = [
          ...prev,
          { id: crypto.randomUUID(), key, value: "" },
        ];
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

  async function confirmDeleteSpecification() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);

    if (dashboardUsesMongoDb()) {
      try {
        const next = await dashboardRequest<DashboardSpecificationRow[]>(
          `/api/dashboard/specifications/${id}`,
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
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white px-3.5 py-2.5 text-sm font-medium text-secondary/85 shadow-[0_1px_2px_rgba(15,76,105,0.04)] transition-[background-color,border-color,box-shadow,color] hover:border-secondary/22 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:min-h-10 sm:py-2";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(227,102,48,0.25)] transition-[filter,transform] hover:brightness-[1.03] active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const destructiveBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(220,38,38,0.28)] transition-[filter,transform] hover:bg-red-700 active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2";

  const iconEditBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-yellow-600 transition-[background-color,color] hover:bg-yellow-400/18 hover:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 lg:size-10";

  const iconDeleteBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-red-600 transition-[background-color,color] hover:bg-red-500/14 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 lg:size-10";

  /** Below `lg`, sidebar is a drawer — use stacked rows; from `lg`, fixed sidebar + table. */
  const tableBlock = (
    <>
      <table className="w-full min-w-[20rem] table-fixed border-collapse text-left text-[14px]">
        <colgroup>
          <col />
          <col className="w-[8.5rem]" />
        </colgroup>
        <thead>
          <tr className="border-b border-secondary/[0.06] ">
            <th
              scope="col"
              className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
            >
              Label
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
              className="group bg-white transition-colors"
            >
              <td className="px-4 py-4 align-middle lg:px-6">
                <span className="inline-flex max-w-full rounded-lg px-2.5 py-1 text-[13px] font-medium tracking-tight text-secondary">
                  <span className="truncate">{row.key}</span>
                </span>
              </td>
              <td className="px-4 py-4 text-right align-middle lg:px-6">
                <div className="flex justify-end gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className={iconEditBtn}
                    aria-label={`Edit ${row.key}`}
                  >
                    <IconPencil className="size-[18px] lg:size-[17px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => requestDelete(row)}
                    className={iconDeleteBtn}
                    aria-label={`Remove ${row.key}`}
                  >
                    <IconTrash className="size-[18px] lg:size-[17px]" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
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
        <span className="font-medium text-secondary/70">Specifications</span>
      </nav>

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/10  px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/55">
            <IconLayers className="size-3.5 shrink-0 opacity-70" />
            <span className="truncate">Catalog attributes</span>
          </div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-secondary sm:text-3xl">
            Specifications
          </h1>
          <p className="text-[15px] leading-relaxed text-secondary/58">
            Add reusable specification labels. Enter each value when editing a
            product — the storefront shows label and value on the detail page.
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
            New specification
          </button>
        </div>
      </header>

      <section className="mt-8 overflow-hidden rounded-xl border border-secondary/[0.09] bg-white shadow-[0_1px_3px_rgba(15,76,105,0.06),0_8px_24px_-8px_rgba(15,76,105,0.08)] sm:mt-10 sm:rounded-2xl">
        <div className="border-b border-secondary/[0.06] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-secondary">
              Attribute library
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-secondary/48">
              Labels listed here appear as choices when you edit products.
            </p>
          </div>
        </div>

        {!hydrated ? (
          <>
            <ul
              className="divide-y divide-secondary/[0.06] lg:hidden"
              aria-busy="true"
              aria-label="Loading specifications"
            >
              <MobileRowSkeleton />
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[20rem] table-fixed border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-secondary/[0.06] ">
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42 lg:px-6"
                    >
                      Label
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
              <div className="flex size-14 items-center justify-center rounded-2xl border border-secondary/10  text-secondary/35">
                <IconLayers className="size-7" />
              </div>
              <p className="mt-5 text-[15px] font-semibold text-secondary">
                No specifications yet
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-secondary/48">
                Create your first label to reuse when editing products.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className={`${primaryBtn} ${touchFullSmAuto} mt-6 max-w-xs`}
              >
                <IconPlus className="size-[18px]" />
                New specification
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-secondary/[0.06] lg:hidden">
              {paginatedRows.map((row) => (
                <li key={row.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex min-w-0 max-w-[min(100%,14rem)] rounded-lg px-2.5 py-1 text-[13px] font-medium tracking-tight text-secondary sm:max-w-[70%]">
                      <span className="truncate">{row.key}</span>
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className={iconEditBtn}
                        aria-label={`Edit ${row.key}`}
                      >
                        <IconPencil className="size-[18px] lg:size-[17px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(row)}
                        className={iconDeleteBtn}
                        aria-label={`Remove ${row.key}`}
                      >
                        <IconTrash className="size-[18px] lg:size-[17px]" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 break-words text-[13px] leading-relaxed text-secondary/45">
                    {row.value.trim()
                      ? `Template hint: ${row.value}`
                      : "Set the value on each product."}
                  </p>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">{tableBlock}</div>
          </>
        )}

        {hydrated && rows.length > pageSize ? (
          <footer className="flex flex-col gap-4 border-t border-secondary/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
        aria-labelledby="spec-modal-title"
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
              id="spec-modal-title"
              className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
            >
              {editingId ? "Edit specification" : "New specification"}
            </h2>
            <p className="text-[13px] leading-relaxed text-secondary/52">
              Enter the specification label only. Values are filled in per product.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 transition-[background-color,color,border-color] hover:border-secondary/12 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-10"
            aria-label="Close dialog"
          >
            <IconX className="size-[18px]" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-1 sm:px-6 sm:pt-3">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="spec-key"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42"
                >
                  Label
                </label>
                <input
                  ref={keyInputRef}
                  id="spec-key"
                  name="key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="e.g. Material"
                  autoComplete="off"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06]  px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:pb-4">
            <button
              type="button"
              onClick={closeModal}
              className={`${ghostBtn} ${touchFullSmAuto}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${primaryBtn} ${touchFullSmAuto}`}
            >
              {editingId ? "Save changes" : "Create specification"}
            </button>
          </div>
        </form>
        </div>
      </dialog>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-spec-dialog-title"
        aria-describedby="delete-spec-dialog-desc"
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
                id="delete-spec-dialog-title"
                className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
              >
                Remove specification?
              </h2>
              <p
                id="delete-spec-dialog-desc"
                className="text-[13px] leading-relaxed text-secondary/55"
              >
                This row will be removed from your attribute library. Products
                already using it are unchanged until you edit them separately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeleteDialog}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 transition-[background-color,color,border-color] hover:border-secondary/12 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:size-10"
            aria-label="Close dialog"
          >
            <IconX className="size-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 sm:px-6">
          {pendingDelete ? (
            <div className="mt-2 rounded-xl border border-secondary/[0.08] px-4 py-3 sm:mt-4">
              <dl className="grid gap-2 text-[13px]">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Key
                  </dt>
                  <dd className="mt-0.5 break-words font-medium text-secondary">
                    {pendingDelete.key}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Value
                  </dt>
                  <dd className="mt-0.5 break-words text-secondary/85">
                    {pendingDelete.value}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:pb-4">
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
            onClick={confirmDeleteSpecification}
            className={`${destructiveBtn} ${touchFullSmAuto}`}
          >
            <IconTrash className="size-[17px] opacity-95" />
            Delete specification
          </button>
        </div>
        </div>
      </dialog>
    </div>
  );
}
