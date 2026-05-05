"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import { CATEGORY_STORAGE_KEY } from "@/lib/dashboard/category-catalog";
import { dashboardGet, dashboardRequest, dashboardUploadImage } from "@/lib/dashboard/dashboard-fetch";
import {
  parseStoredProducts,
  PRODUCT_LIST_PAGE_SIZE,
  PRODUCT_STORAGE_KEY,
} from "@/lib/dashboard/product-catalog";
import {
  SPECIFICATION_DEFAULT_SEED,
  SPECIFICATION_STORAGE_KEY,
} from "@/lib/dashboard/specification-catalog";
import { formatProductPrice } from "@/lib/format-product-price";
import type { Product, ProductBrand } from "@/lib/types/product";

/** Browser-only catalog: keep data URLs small. */
const LOCAL_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const CLOUDINARY_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

function normalizeStoredImage(raw: string): string {
  const image = raw.trim();
  if (!image) return "/images/product-placeholder.svg";
  if (image.startsWith("data:image/")) return image;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/")) return image;
  return `/${image.replace(/^\/+/, "")}`;
}

function loadSpecs(): DashboardSpecificationRow[] {
  if (typeof window === "undefined") return SPECIFICATION_DEFAULT_SEED;
  try {
    const raw = window.localStorage.getItem(SPECIFICATION_STORAGE_KEY);
    if (raw === null) return SPECIFICATION_DEFAULT_SEED;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SPECIFICATION_DEFAULT_SEED;
    const rows = parsed
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
      .filter((row) => row.key.length > 0 && row.value.length > 0);
    return rows.length ? rows : SPECIFICATION_DEFAULT_SEED;
  } catch {
    return SPECIFICATION_DEFAULT_SEED;
  }
}

function loadCategoryNames(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const names = parsed
      .filter(
        (row): row is { name: string } =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as { name?: string }).name === "string",
      )
      .map((row) => row.name.trim())
      .filter(Boolean);
    const uniq = [...new Set(names)];
    return uniq.length
      ? uniq.sort((a, b) => a.localeCompare(b))
      : [];
  } catch {
    return [];
  }
}

function persistProducts(rows: Product[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(rows));
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

function IconEye({ className }: { className?: string }) {
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

function IconPackage({ className }: { className?: string }) {
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Thumb({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const effective = broken ? "/images/product-placeholder.svg" : src;
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-secondary/10 bg-muted/40 ${className ?? ""}`}
    >
      <Image
        src={effective}
        alt={alt}
        fill
        sizes="80px"
        className="object-cover"
        unoptimized={
          effective.endsWith(".svg") ||
          effective.startsWith("data:") ||
          effective.includes("placeholder") ||
          /^https?:\/\//i.test(effective)
        }
        onError={() => setBroken(true)}
      />
    </div>
  );
}

export function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [persistBackend, setPersistBackend] = useState<"api" | "local" | null>(
    null,
  );
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [specOptions, setSpecOptions] =
    useState<DashboardSpecificationRow[]>(SPECIFICATION_DEFAULT_SEED);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  const [imageInput, setImageInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [stockInput, setStockInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    [],
  );
  const [brandInput, setBrandInput] = useState<ProductBrand>("Ambassador");
  const [activeInput, setActiveInput] = useState(true);
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([]);
  /** Value per specification template id (entered per product). */
  const [specValuesById, setSpecValuesById] = useState<Record<string, string>>(
    {},
  );

  const [activeSavingId, setActiveSavingId] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const retryFetchFromServer = useCallback(async () => {
    setHydrated(false);
    try {
      const list = await dashboardGet<Product[]>("/api/dashboard/products");
      setProducts(list);
      setPersistBackend("api");
      setLoadWarning(null);
    } catch {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(PRODUCT_STORAGE_KEY)
          : null;
      setProducts(parseStoredProducts(raw));
      setPersistBackend("local");
      setLoadWarning(
        "Could not load products from the server. Showing data stored in this browser instead.",
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  const refreshLists = useCallback(() => {
    if (persistBackend !== "api") {
      setSpecOptions(loadSpecs());
      setCategoryOptions(loadCategoryNames());
      return;
    }
    void Promise.all([
      dashboardGet<DashboardSpecificationRow[]>("/api/dashboard/specifications"),
      dashboardGet<DashboardCategoryRow[]>("/api/dashboard/categories"),
    ])
      .then(([specs, cats]) => {
        setSpecOptions(specs);
        setCategoryOptions(
          cats.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
        );
      })
      .catch(() => {});
  }, [persistBackend]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    dashboardGet<Product[]>("/api/dashboard/products")
      .then((list) => {
        if (!cancelled) {
          setProducts(list);
          setPersistBackend("api");
          setLoadWarning(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const raw = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
          setProducts(parseStoredProducts(raw));
          setPersistBackend("local");
          setLoadWarning(
            "Could not load products from the server. Showing data stored in this browser instead.",
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
    if (!hydrated || !persistBackend) return;
    queueMicrotask(() => {
      refreshLists();
    });
  }, [hydrated, persistBackend, refreshLists]);

  useEffect(() => {
    if (!hydrated || persistBackend !== "local") return;
    persistProducts(products);
  }, [products, hydrated, persistBackend]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const hay =
        `${p.name} ${p.categories.join(" ")} ${p.description} ${p.brand}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, searchQuery]);

  const editingProduct =
    editingId === null
      ? null
      : (products.find((p) => p.id === editingId) ?? null);

  const categoryCheckboxOptions = useMemo(() => {
    const s = new Set(categoryOptions);
    if (editingProduct) {
      for (const c of editingProduct.categories) {
        s.add(c);
      }
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [categoryOptions, editingProduct]);

  const pageSize = PRODUCT_LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      queueMicrotask(() => setPage(totalPages));
    }
  }, [page, totalPages]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [searchQuery]);

  useEffect(() => {
    const lockScroll = modalOpen || viewing !== null || pendingDelete !== null;
    if (!lockScroll || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen, viewing, pendingDelete]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (modalOpen && !d.open) {
      refreshLists();
      d.showModal();
    } else if (!modalOpen && d.open) {
      d.close();
    }
  }, [modalOpen, refreshLists]);

  useEffect(() => {
    const d = viewDialogRef.current;
    if (!d) return;
    if (viewing && !d.open) d.showModal();
    else if (!viewing && d.open) d.close();
  }, [viewing]);

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

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function resetForm(categoryNames?: string[]) {
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    setImageInput("");
    setNameInput("");
    setDescriptionInput("");
    setStockInput("");
    setPriceInput("");
    const catFallback = categoryNames ?? categoryOptions;
    setSelectedCategoryNames(catFallback.length ? [catFallback[0]] : []);
    setBrandInput("Ambassador");
    setActiveInput(true);
    setSelectedSpecIds([]);
    setSpecValuesById({});
    setFormError(null);
  }

  async function openAdd() {
    setPendingDelete(null);
    setViewing(null);
    setEditingId(null);

    if (persistBackend === "api") {
      try {
        const [cats, specs] = await Promise.all([
          dashboardGet<DashboardCategoryRow[]>("/api/dashboard/categories"),
          dashboardGet<DashboardSpecificationRow[]>("/api/dashboard/specifications"),
        ]);
        const names = cats.map((c) => c.name).sort((a, b) => a.localeCompare(b));
        setCategoryOptions(names);
        setSpecOptions(specs);
        resetForm(names);
      } catch {
        refreshLists();
        resetForm();
      }
      setModalOpen(true);
      return;
    }

    refreshLists();
    resetForm();
    setModalOpen(true);
  }

  async function openEdit(p: Product) {
    setPendingDelete(null);
    setViewing(null);

    let specs: DashboardSpecificationRow[];
    if (persistBackend === "api") {
      try {
        specs = await dashboardGet<DashboardSpecificationRow[]>(
          "/api/dashboard/specifications",
        );
        setSpecOptions(specs);
      } catch {
        specs = [];
        setSpecOptions([]);
      }
      refreshLists();
    } else {
      refreshLists();
      specs = loadSpecs();
    }

    setEditingId(p.id);
    setImageInput(p.image);
    setNameInput(p.name);
    setDescriptionInput(p.description);
    setStockInput(String(p.stock));
    setPriceInput(String(p.price));
    setSelectedCategoryNames([...p.categories]);
    setBrandInput(p.brand);
    const matchedIds = specs
      .filter((row) =>
        p.specifications.some(
          (ps) =>
            ps.label.trim().toLowerCase() === row.key.toLowerCase(),
        ),
      )
      .map((r) => r.id);

    const initialSpecValues: Record<string, string> = {};
    for (const row of specs) {
      if (!matchedIds.includes(row.id)) continue;
      const ps = p.specifications.find(
        (x) => x.label.trim().toLowerCase() === row.key.toLowerCase(),
      );
      if (ps) initialSpecValues[row.id] = ps.value;
    }

    setSelectedSpecIds(matchedIds);
    setSpecValuesById(initialSpecValues);
    setActiveInput(p.active !== false);
    setFormError(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  }

  function onProductImageFileChange(e: ChangeEvent<HTMLInputElement>) {
    void onProductImageFileChangeAsync(e);
  }

  async function onProductImageFileChangeAsync(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file (PNG, JPG, WebP, etc.).");
      input.value = "";
      return;
    }

    const maxBytes =
      persistBackend === "api"
        ? CLOUDINARY_IMAGE_MAX_BYTES
        : LOCAL_IMAGE_MAX_BYTES;
    if (file.size > maxBytes) {
      setFormError(`Image must be ${maxBytes / (1024 * 1024)}MB or smaller.`);
      input.value = "";
      return;
    }

    if (persistBackend === "api") {
      setUploadingImage(true);
      setFormError(null);
      try {
        const { url } = await dashboardUploadImage(file);
        setImageInput(url);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not upload image.",
        );
      } finally {
        setUploadingImage(false);
        input.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageInput(result);
        setFormError(null);
      }
    };
    reader.onerror = () => {
      setFormError("Could not read that file.");
      input.value = "";
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameInput.trim();
    const description = descriptionInput.trim();
    const categories = [...selectedCategoryNames].sort((a, b) =>
      a.localeCompare(b),
    );
    const stockNum = Number(stockInput);
    const priceNum = Number(priceInput);
    const image = normalizeStoredImage(imageInput);

    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (categories.length === 0) {
      setFormError("Select at least one category.");
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setFormError("Stock must be a whole number ≥ 0.");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setFormError("Price must be zero or greater.");
      return;
    }

    let specsRows: DashboardSpecificationRow[];
    try {
      specsRows =
        persistBackend === "api"
          ? await dashboardGet<DashboardSpecificationRow[]>(
              "/api/dashboard/specifications",
            )
          : loadSpecs();
    } catch {
      setFormError("Could not load specifications.");
      return;
    }

    const specifications = specsRows
      .filter((row) => selectedSpecIds.includes(row.id))
      .map((row) => ({
        label: row.key,
        value: (specValuesById[row.id] ?? "").trim(),
      }));

    setFormError(null);

    if (persistBackend === "api") {
      const existing = editingId
        ? products.find((p) => p.id === editingId)
        : null;
      if (editingId && !existing) {
        setFormError("Product not found.");
        return;
      }
      const id = editingId ?? crypto.randomUUID();
      const fullProduct: Product = {
        id,
        image,
        name,
        description,
        categories,
        stock: stockNum,
        price: priceNum,
        currency: existing?.currency ?? "PKR",
        brand: brandInput,
        specifications,
        active: activeInput,
      };

      try {
        if (editingId) {
          await dashboardRequest<Product>(
            `/api/dashboard/products/${editingId}`,
            {
              method: "PATCH",
              body: JSON.stringify(fullProduct),
            },
          );
        } else {
          await dashboardRequest<Product>("/api/dashboard/products", {
            method: "POST",
            body: JSON.stringify(fullProduct),
          });
        }

        const list = await dashboardGet<Product[]>("/api/dashboard/products");
        setProducts(list);

        const q = searchQuery.trim().toLowerCase();
        if (!editingId) {
          const matches =
            !q ||
            `${fullProduct.name} ${fullProduct.categories.join(" ")} ${fullProduct.description} ${fullProduct.brand}`
              .toLowerCase()
              .includes(q);
          if (matches) {
            const f = !q
              ? list
              : list.filter((p) => {
                  const hay =
                    `${p.name} ${p.categories.join(" ")} ${p.description} ${p.brand}`.toLowerCase();
                  return hay.includes(q);
                });
            setPage(Math.max(1, Math.ceil(f.length / pageSize)));
          }
        }

        closeModal();
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Could not save product.",
        );
      }
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                image,
                name,
                description,
                categories,
                stock: stockNum,
                price: priceNum,
                brand: brandInput,
                specifications,
                active: activeInput,
              }
            : p,
        ),
      );
    } else {
      const id = crypto.randomUUID();
      const newProduct: Product = {
        id,
        image,
        name,
        description,
        categories,
        stock: stockNum,
        price: priceNum,
        currency: "PKR",
        brand: brandInput,
        specifications,
        active: activeInput,
      };
      const q = searchQuery.trim().toLowerCase();
      setProducts((prev) => {
        const next = [...prev, newProduct];
        const matches =
          !q ||
          `${newProduct.name} ${newProduct.categories.join(" ")} ${newProduct.description} ${newProduct.brand}`
            .toLowerCase()
            .includes(q);
        if (matches) {
          const f = !q
            ? next
            : next.filter((p) => {
                const hay =
                  `${p.name} ${p.categories.join(" ")} ${p.description} ${p.brand}`.toLowerCase();
                return hay.includes(q);
              });
          setPage(Math.max(1, Math.ceil(f.length / pageSize)));
        }
        return next;
      });
    }
    closeModal();
  }

  const requestDelete = useCallback((p: Product) => {
    setModalOpen(false);
    setEditingId(null);
    setFormError(null);
    setPendingDelete(p);
  }, []);

  const closeDelete = useCallback(() => setPendingDelete(null), []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    setViewing((v) => (v?.id === id ? null : v));

    if (persistBackend === "api") {
      try {
        await dashboardRequest(`/api/dashboard/products/${id}`, {
          method: "DELETE",
        });
        const list = await dashboardGet<Product[]>("/api/dashboard/products");
        setProducts(list);
      } catch {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function persistProductActive(p: Product, nextActive: boolean) {
    if (persistBackend === "api") {
      setActiveSavingId(p.id);
      try {
        await dashboardRequest<Product>(`/api/dashboard/products/${p.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...p, active: nextActive }),
        });
        const list = await dashboardGet<Product[]>("/api/dashboard/products");
        setProducts(list);
      } finally {
        setActiveSavingId(null);
      }
      return;
    }
    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, active: nextActive } : x,
      ),
    );
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const rangeStart =
    filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filtered.length);

  const touchFullSmAuto = "w-full min-[480px]:w-auto";

  const ghostBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary/15 bg-white px-3.5 py-2.5 text-sm font-medium text-secondary/85 shadow-[0_1px_2px_rgba(15,76,105,0.04)] transition-[background-color,border-color,box-shadow,color] hover:border-secondary/22 hover:bg-secondary/[0.04] hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:min-h-10 sm:py-2";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(227,102,48,0.25)] transition-[filter,transform] hover:brightness-[1.03] active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const destructiveBtn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(220,38,38,0.28)] transition-[filter,transform] hover:bg-red-700 active:translate-y-[0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2";

  const iconViewBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-secondary transition-[background-color,color] hover:bg-secondary/[0.08] hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 lg:size-10";

  const iconEditBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-yellow-600 transition-[background-color,color] hover:bg-yellow-400/18 hover:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 lg:size-10";

  const iconDeleteBtn =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-red-600 transition-[background-color,color] hover:bg-red-500/14 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 lg:size-10";

  const inputClass =
    "min-h-11 w-full rounded-xl border border-secondary/12 bg-white px-3.5 py-2.5 text-[15px] text-secondary outline-none ring-primary transition-[box-shadow,border-color] placeholder:text-secondary/35 focus-visible:border-transparent focus-visible:ring-2";

  const textareaClass =
    "min-h-[100px] w-full rounded-xl border border-secondary/12 bg-white px-3.5 py-2.5 text-[15px] text-secondary outline-none ring-primary transition-[box-shadow,border-color] placeholder:text-secondary/35 focus-visible:border-transparent focus-visible:ring-2";

  function toggleCategory(name: string) {
    setSelectedCategoryNames((prev) =>
      prev.includes(name)
        ? prev.filter((x) => x !== name)
        : [...prev, name],
    );
    setFormError(null);
  }

  function toggleSpec(id: string) {
    setSelectedSpecIds((prev) => {
      if (prev.includes(id)) {
        setSpecValuesById((vals) => {
          const next = { ...vals };
          delete next[id];
          return next;
        });
        return prev.filter((x) => x !== id);
      }
      const row = specOptions.find((r) => r.id === id);
      setSpecValuesById((vals) => ({
        ...vals,
        [id]: vals[id] ?? row?.value?.trim() ?? "",
      }));
      return [...prev, id];
    });
    setFormError(null);
  }

  function setSpecValue(id: string, value: string) {
    setSpecValuesById((prev) => ({ ...prev, [id]: value }));
  }

  const brandBtn =
    "flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-[border-color,background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  return (
    <div className="mx-auto min-w-0 w-full max-w-7xl pb-8 sm:pb-10">
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
        <span className="font-medium text-secondary/70">Products</span>
      </nav>

      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-secondary/10 bg-secondary/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/55">
            <IconPackage className="size-3.5 shrink-0 opacity-70" />
            <span className="truncate">Catalog inventory</span>
          </div>
          <h1 className="text-[1.65rem] font-semibold tracking-tight text-secondary sm:text-3xl">
            Products
          </h1>
          <p className="text-[15px] leading-relaxed text-secondary/58">
            Create, read, update, and delete catalog rows.{" "}
            {persistBackend === "api"
              ? "Changes sync to MongoDB; images upload via Cloudinary."
              : !hydrated || persistBackend === null
                ? "Loading…"
                : loadWarning
                  ? "Using browser-only storage until the server responds."
                  : "Stored in this browser when the API is unavailable."}{" "}
            Search filters the grid below.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:max-w-md">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-secondary/40" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, categories, description…"
              className={`${inputClass} min-h-12 pl-10`}
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3 min-[480px]:justify-end">
            <div className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-secondary/10 bg-white px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,1)] min-[480px]:max-w-[12rem] min-[480px]:flex-none">
              <span className="text-[13px] text-secondary/45">Showing</span>
              <span className="tabular-nums text-[15px] font-semibold text-secondary">
                {hydrated ? filtered.length : "—"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void openAdd()}
              className={`${primaryBtn} ${touchFullSmAuto}`}
            >
              <IconPlus className="size-[18px] opacity-95" />
              Add product
            </button>
          </div>
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
          <h2 className="text-[15px] font-semibold text-secondary">
            Product list
          </h2>
          <p className="mt-0.5 text-[13px] text-secondary/48">
            {!hydrated || persistBackend === null
              ? "…"
              : persistBackend === "api"
                ? "Rows persist in MongoDB. Customer storefront lists only active products; inactive rows stay in the dashboard."
                : "Rows stay in this browser until the API is reachable again."}
          </p>
        </div>

        {!hydrated ? (
          <div className="px-6 py-16 text-center text-secondary/55">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-14 text-center sm:px-6">
            <p className="text-[15px] font-semibold text-secondary">
              No products match
            </p>
            <p className="mt-2 text-[13px] text-secondary/48">
              {searchQuery.trim()
                ? "Try a different search or clear the filter."
                : "Reset storage or add a product."}
            </p>
            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`${ghostBtn} mt-5`}
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void openAdd()}
                className={`${primaryBtn} mt-5`}
              >
                Add product
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="divide-y divide-secondary/[0.06] xl:hidden">
              {paginated.map((p) => (
                <li
                  key={p.id}
                  className={`px-4 py-4 sm:px-5 ${p.active === false ? "opacity-[0.88]" : ""}`}
                >
                  <div className="flex gap-3">
                    <Thumb
                      src={p.image}
                      alt=""
                      className="relative size-14 sm:size-16"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="truncate font-semibold text-secondary">
                          {p.name}
                        </p>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.active !== false}
                            aria-label={
                              p.active !== false
                                ? `Hide ${p.name} from storefront`
                                : `Show ${p.name} on storefront`
                            }
                            disabled={activeSavingId === p.id}
                            onClick={() =>
                              void persistProductActive(p, p.active === false)
                            }
                            className={`relative inline-flex h-8 w-[3.35rem] shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-45 ${
                              p.active !== false
                                ? "bg-emerald-600"
                                : "bg-secondary/25"
                            }`}
                          >
                            <span
                              className={`pointer-events-none absolute top-0.5 block size-[1.625rem] rounded-full bg-white shadow transition-[transform] duration-200 ease-out ${
                                p.active !== false
                                  ? "translate-x-[1.45rem]"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary/40">
                            {p.active !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] text-secondary/50">
                        {p.categories.join(" · ")} · {p.brand}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {formatProductPrice(p.price, p.currency)}{" "}
                        <span className="font-normal text-secondary/55">
                          · Stock {p.stock}
                        </span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          type="button"
                          className={iconViewBtn}
                          aria-label={`View ${p.name}`}
                          onClick={() => setViewing(p)}
                        >
                          <IconEye className="size-[18px]" />
                        </button>
                        <button
                          type="button"
                          className={iconEditBtn}
                          aria-label={`Edit ${p.name}`}
                          onClick={() => void openEdit(p)}
                        >
                          <IconPencil className="size-[18px]" />
                        </button>
                        <button
                          type="button"
                          className={iconDeleteBtn}
                          aria-label={`Delete ${p.name}`}
                          onClick={() => requestDelete(p)}
                        >
                          <IconTrash className="size-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[54rem] table-fixed border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-secondary/[0.06] bg-secondary/[0.03]">
                    <th className="w-20 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Image
                    </th>
                    <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Name
                    </th>
                    <th className="w-[11rem] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Categories
                    </th>
                    <th className="w-[7rem] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Brand
                    </th>
                    <th className="w-[4.5rem] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Stock
                    </th>
                    <th className="w-[6rem] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Price
                    </th>
                    <th className="w-[6.5rem] px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      Active
                    </th>
                    <th className="w-[9.5rem] px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary/42">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/[0.06]">
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      className={`bg-white transition-colors hover:bg-secondary/[0.02] ${p.active === false ? "opacity-[0.88]" : ""}`}
                    >
                      <td className="px-4 py-3 align-middle">
                        <Thumb
                          src={p.image}
                          alt=""
                          className="relative size-12"
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="line-clamp-2 font-medium text-secondary">
                          {p.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-[13px] text-secondary/75">
                        <span className="line-clamp-2" title={p.categories.join(" · ")}>
                          {p.categories.join(" · ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-[13px] text-secondary/75">
                        {p.brand}
                      </td>
                      <td className="px-4 py-3 align-middle tabular-nums text-[13px] text-secondary">
                        {p.stock}
                      </td>
                      <td className="px-4 py-3 align-middle tabular-nums text-[13px] font-semibold text-primary">
                        {formatProductPrice(p.price, p.currency)}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.active !== false}
                            aria-label={
                              p.active !== false
                                ? `Hide ${p.name} from storefront`
                                : `Show ${p.name} on storefront`
                            }
                            disabled={activeSavingId === p.id}
                            onClick={() =>
                              void persistProductActive(p, p.active === false)
                            }
                            className={`relative inline-flex h-8 w-[3.35rem] shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${
                              p.active !== false
                                ? "bg-emerald-600"
                                : "bg-secondary/25"
                            }`}
                          >
                            <span
                              className={`pointer-events-none absolute top-0.5 block size-[1.625rem] rounded-full bg-white shadow transition-[transform] duration-200 ease-out ${
                                p.active !== false
                                  ? "translate-x-[1.45rem]"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary/40">
                            {p.active !== false ? "On" : "Off"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="flex justify-end gap-0.5">
                          <button
                            type="button"
                            className={iconViewBtn}
                            aria-label={`View ${p.name}`}
                            onClick={() => setViewing(p)}
                          >
                            <IconEye className="size-[17px]" />
                          </button>
                          <button
                            type="button"
                            className={iconEditBtn}
                            aria-label={`Edit ${p.name}`}
                            onClick={() => void openEdit(p)}
                          >
                            <IconPencil className="size-[17px]" />
                          </button>
                          <button
                            type="button"
                            className={iconDeleteBtn}
                            aria-label={`Delete ${p.name}`}
                            onClick={() => requestDelete(p)}
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

        {hydrated && filtered.length > pageSize ? (
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
                {filtered.length}
              </span>
            </p>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <span className="text-center text-[13px] text-secondary/48 xl:hidden">
                Page{" "}
                <span className="font-semibold text-secondary">{page}</span>
                <span className="text-secondary/35"> / </span>
                <span className="font-semibold text-secondary">{totalPages}</span>
              </span>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setPage((x) => Math.max(1, x - 1))}
                  className={`${ghostBtn} min-h-11 px-3 sm:min-h-10`}
                >
                  <IconChevronLeft className="size-4 opacity-70" />
                  Previous
                </button>
                <span className="hidden min-w-[7rem] text-center text-[13px] text-secondary/48 xl:inline">
                  Page{" "}
                  <span className="font-semibold text-secondary">{page}</span>
                  <span className="text-secondary/35"> / </span>
                  <span className="font-semibold text-secondary">{totalPages}</span>
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() =>
                    setPage((x) => Math.min(totalPages, x + 1))
                  }
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

      {/* Add / Edit */}
      <dialog
        ref={dialogRef}
        aria-labelledby="product-form-title"
        className="fixed left-1/2 top-1/2 z-[100] flex h-[min(92dvh,calc(100vh-1rem))] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-secondary/12 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(15,76,105,0.28)] backdrop:bg-secondary/35 backdrop:backdrop-blur-md sm:w-[min(520px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeModal();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
            <div>
              <h2
                id="product-form-title"
                className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
              >
                {editingId ? "Edit product" : "Add product"}
              </h2>
              <p className="mt-1 text-[13px] text-secondary/52">
                {persistBackend === "api"
                  ? `Images upload to Cloudinary (up to ${CLOUDINARY_IMAGE_MAX_BYTES / (1024 * 1024)} MB). Only the image URL is saved in MongoDB.`
                  : `Choose an image from your computer (max ${LOCAL_IMAGE_MAX_BYTES / (1024 * 1024)} MB). Stored as a data URL in this browser.`}
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 hover:bg-secondary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-10"
              aria-label="Close"
            >
              <IconX className="size-[18px]" />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-3 pt-2 sm:px-6 [scrollbar-gutter:stable]">
              {formError ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-800"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                  Image
                </span>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  tabIndex={-1}
                  aria-label="Choose image file from computer"
                  onChange={onProductImageFileChange}
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => imageFileInputRef.current?.click()}
                  className={`${ghostBtn} ${touchFullSmAuto}`}
                >
                  {uploadingImage ? "Uploading…" : "Choose from computer"}
                </button>
                <p className="mt-2 text-[12px] text-secondary/48">
                  {persistBackend === "api"
                    ? "PNG, JPG, WebP — uploads require Cloudinary credentials on the server."
                    : "PNG, JPG, WebP, GIF, SVG — choose another file anytime to replace."}
                </p>
                {uploadingImage ? (
                  <p className="mt-2 text-[12px] font-medium text-secondary/55">
                    Uploading to Cloudinary…
                  </p>
                ) : imageInput.startsWith("data:image/") ? (
                  <p className="mt-2 text-[12px] font-medium text-secondary/55">
                    Using file from computer (browser storage).
                  </p>
                ) : /^https?:\/\//i.test(imageInput.trim()) ? (
                  <p className="mt-2 text-[12px] font-medium text-secondary/55">
                    Using hosted image URL.
                  </p>
                ) : imageInput.trim().length > 0 ? (
                  <p className="mt-2 text-[12px] font-medium text-secondary/55">
                    Current catalog image — choose a file above to replace it.
                  </p>
                ) : null}
                <div className="relative mx-auto mt-3 aspect-square w-full max-w-[140px] overflow-hidden rounded-xl border border-secondary/10 bg-muted/30">
                  <Image
                    src={normalizeStoredImage(imageInput)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => {}}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Name
                  </label>
                  <input
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setFormError(null);
                    }}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                    Categories (multi-select)
                  </legend>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-secondary/10 bg-secondary/[0.02] p-3">
                    {categoryCheckboxOptions.map((c) => (
                      <label
                        key={c}
                        className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-white"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryNames.includes(c)}
                          onChange={() => toggleCategory(c)}
                          className="mt-1 size-4 shrink-0 rounded border-secondary/25 text-primary focus:ring-primary"
                        />
                        <span className="text-secondary">{c}</span>
                      </label>
                    ))}
                    {categoryCheckboxOptions.length === 0 ? (
                      <p className="text-[13px] text-secondary/50">
                        Add categories under Dashboard → Categories first.
                      </p>
                    ) : null}
                  </div>
                </fieldset>
              </div>

              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                  Brand
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrandInput("Ambassador")}
                    className={`${brandBtn} ${
                      brandInput === "Ambassador"
                        ? "border-primary bg-primary text-white"
                        : "border-secondary/15 bg-white text-secondary hover:border-secondary/25"
                    }`}
                  >
                    Ambassador
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandInput("Imported")}
                    className={`${brandBtn} ${
                      brandInput === "Imported"
                        ? "border-primary bg-primary text-white"
                        : "border-secondary/15 bg-white text-secondary hover:border-secondary/25"
                    }`}
                  >
                    Imported
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                  Description
                </label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className={textareaClass}
                  rows={4}
                />
              </div>

              <div className="rounded-xl border border-secondary/10 bg-secondary/[0.02] px-3 py-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={activeInput}
                    onChange={(e) => setActiveInput(e.target.checked)}
                    className="mt-1 size-4 shrink-0 rounded border-secondary/25 text-primary focus:ring-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-secondary">
                      Visible on storefront
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-secondary/48">
                      Uncheck to hide this product from the public catalog without
                      deleting it.
                    </span>
                  </span>
                </label>
              </div>

              <fieldset>
                <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                  Specifications (optional)
                </legend>
                <p className="mb-3 text-[12px] leading-relaxed text-secondary/48">
                  Choose labels from your library, then enter the value for this
                  product.
                </p>
                <div className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-secondary/10 bg-secondary/[0.02] p-3">
                  {specOptions.map((row) => (
                    <div key={row.id} className="rounded-lg px-2 py-1">
                      <label className="flex cursor-pointer items-start gap-2 text-[13px] hover:bg-white">
                        <input
                          type="checkbox"
                          checked={selectedSpecIds.includes(row.id)}
                          onChange={() => toggleSpec(row.id)}
                          className="mt-1 size-4 shrink-0 rounded border-secondary/25 text-primary focus:ring-primary"
                        />
                        <span className="min-w-0 flex-1 font-medium text-secondary">
                          {row.key}
                          {row.value.trim() ? (
                            <span className="mt-0.5 block font-normal text-secondary/50">
                              Template hint: {row.value}
                            </span>
                          ) : null}
                        </span>
                      </label>
                      {selectedSpecIds.includes(row.id) ? (
                        <label className="mt-2 block pl-6">
                          <span className="sr-only">Value for {row.key}</span>
                          <input
                            type="text"
                            value={specValuesById[row.id] ?? ""}
                            onChange={(e) =>
                              setSpecValue(row.id, e.target.value)
                            }
                            placeholder={`${row.key} — value for this product`}
                            className={`${inputClass} text-[13px]`}
                          />
                        </label>
                      ) : null}
                    </div>
                  ))}
                  {specOptions.length === 0 ? (
                    <p className="text-[13px] text-secondary/50">
                      No specification templates — add some under Specifications.
                    </p>
                  ) : null}
                </div>
              </fieldset>
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] bg-secondary/[0.02] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-2 sm:px-6 sm:pb-4">
              <button
                type="button"
                onClick={closeModal}
                className={`${ghostBtn} ${touchFullSmAuto}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage}
                className={`${primaryBtn} ${touchFullSmAuto}`}
              >
                {editingId ? "Save product" : "Create product"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* View */}
      <dialog
        ref={viewDialogRef}
        aria-labelledby="product-view-title"
        className="fixed left-1/2 top-1/2 z-[100] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-secondary/12 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(15,76,105,0.28)] backdrop:bg-secondary/35 backdrop:backdrop-blur-md sm:w-[min(480px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          setViewing(null);
        }}
      >
        <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
          {viewing ? (
            <>
              <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="product-view-title"
                      className="text-lg font-semibold tracking-tight text-secondary sm:text-xl"
                    >
                      {viewing.name}
                    </h2>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        viewing.active === false
                          ? "bg-secondary/15 text-secondary/70"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {viewing.active === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-secondary/45 hover:bg-secondary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:size-10"
                  aria-label="Close"
                >
                  <IconX className="size-[18px]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4 sm:px-6">
                <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-secondary/10 bg-muted/30">
                  <Image
                    src={viewing.image}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <dl className="mt-4 space-y-3 text-[14px]">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                      Categories · Brand
                    </dt>
                    <dd className="mt-0.5 text-secondary">
                      {viewing.categories.join(" · ")} · {viewing.brand}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                      Price · Stock
                    </dt>
                    <dd className="mt-0.5 font-semibold text-primary">
                      {formatProductPrice(viewing.price, viewing.currency)} · Stock{" "}
                      {viewing.stock}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                      Description
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap leading-relaxed text-secondary/85">
                      {viewing.description}
                    </dd>
                  </div>
                  {viewing.specifications.length ? (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary/42">
                        Specifications
                      </dt>
                      <dd className="mt-2 space-y-1">
                        {viewing.specifications.map((s, i) => (
                          <div
                            key={`${s.label}-${i}`}
                            className="flex justify-between gap-4 border-b border-secondary/[0.06] py-1.5 text-[13px] last:border-0"
                          >
                            <span className="font-medium text-secondary">
                              {s.label}
                            </span>
                            <span className="text-right text-secondary/80">
                              {s.value.trim() ? s.value : "—"}
                            </span>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </>
          ) : null}
        </div>
      </dialog>

      {/* Delete */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-product-title"
        className="fixed left-1/2 top-1/2 z-[105] max-h-[min(92dvh,calc(100vh-1rem))] w-[calc(100vw-1.25rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-red-200/80 bg-white p-0 shadow-[0_24px_48px_-12px_rgba(185,28,28,0.22)] backdrop:bg-secondary/40 backdrop:backdrop-blur-md sm:w-[min(400px,calc(100vw-1.75rem))]"
        onCancel={(ev) => {
          ev.preventDefault();
          closeDelete();
        }}
      >
        <div className="flex max-h-full min-h-0 w-full flex-col overflow-hidden">
          <div className="pointer-events-none h-1 shrink-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 sm:px-6">
            <div className="flex gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-200/70 bg-red-50 text-red-600 sm:size-12">
                <IconAlertTriangle className="size-6 sm:size-7" />
              </div>
              <div>
                <h2
                  id="delete-product-title"
                  className="text-lg font-semibold text-secondary sm:text-xl"
                >
                  Delete product?
                </h2>
                <p className="mt-2 text-[13px] text-secondary/55">
                  {persistBackend === "api"
                    ? "This permanently deletes the product from the database."
                    : "This removes the row from the admin list in this browser only."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeDelete}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-secondary/45 hover:bg-secondary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:size-10"
              aria-label="Close"
            >
              <IconX className="size-[18px]" />
            </button>
          </div>
          <div className="px-4 pb-2 pt-4 sm:px-6">
            {pendingDelete ? (
              <p className="rounded-xl border border-secondary/10 bg-secondary/[0.03] px-3 py-2 text-[14px] font-medium text-secondary">
                {pendingDelete.name}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-secondary/[0.06] bg-secondary/[0.02] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
            <button
              ref={deleteCancelRef}
              type="button"
              onClick={closeDelete}
              className={`${ghostBtn} ${touchFullSmAuto}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className={`${destructiveBtn} ${touchFullSmAuto}`}
            >
              <IconTrash className="size-[17px] opacity-95" />
              Delete product
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
