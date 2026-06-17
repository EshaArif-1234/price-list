"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { CatalogProductImage } from "@/components/products/CatalogProductImage";
import { rememberCatalogNavigationState } from "@/lib/catalog/catalog-session";
import type { CatalogSearchHit } from "@/lib/catalog/search-suggestions";
import { formatCatalogPrice } from "@/lib/format-product-price";

type CatalogSearchSuggestionsProps = {
  query: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  dismissed: boolean;
  onClose: () => void;
  onNavigateToProduct: () => void;
  onSubmitSearch: () => void;
};

export function CatalogSearchSuggestions({
  query,
  inputRef,
  dismissed,
  onClose,
  onNavigateToProduct,
  onSubmitSearch,
}: CatalogSearchSuggestionsProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<CatalogSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = query.trim();
  const showDropdown = !dismissed && trimmed.length >= 2;

  useEffect(() => {
    setActiveIndex(-1);
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as { results?: CatalogSearchHit[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    if (!showDropdown) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        inputRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showDropdown, inputRef, onClose]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target !== input) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        if (results.length === 0) return;
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        if (results.length === 0) return;
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (activeIndex >= 0 && results[activeIndex]) {
          const hit = results[activeIndex];
          rememberCatalogNavigationState(hit.id);
          onNavigateToProduct();
          onClose();
          router.push(`/products/${hit.id}`);
        } else {
          onClose();
          onSubmitSearch();
        }
        return;
      }
    }

    input.addEventListener("keydown", onKeyDown, true);
    return () => input.removeEventListener("keydown", onKeyDown, true);
  }, [
    results,
    activeIndex,
    inputRef,
    onClose,
    onNavigateToProduct,
    onSubmitSearch,
    router,
  ]);

  if (!showDropdown) return null;

  return (
    <div
      ref={containerRef}
      id={listId}
      role="listbox"
      aria-label="Product suggestions"
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-muted bg-white shadow-lg ring-1 ring-black/[0.04]"
    >
      {loading && results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-secondary/55">Searching…</p>
      ) : null}

      {!loading && results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-secondary/55">
          No products match “{trimmed}”
        </p>
      ) : null}

      <ul className="max-h-[min(20rem,60vh)] overflow-y-auto py-1">
        {results.map((hit, index) => {
          const active = index === activeIndex;
          return (
            <li key={hit.id} role="presentation">
              <Link
                href={`/products/${hit.id}`}
                role="option"
                aria-selected={active}
                onClick={() => {
                  rememberCatalogNavigationState(hit.id);
                  onNavigateToProduct();
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center gap-3 px-3 py-2.5 transition-colors sm:px-4 ${
                  active ? "bg-secondary/[0.06]" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-secondary/10 bg-muted/40 sm:size-12">
                  <CatalogProductImage
                    src={hit.image}
                    alt=""
                    fill
                    width={96}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-secondary sm:text-[15px]">
                    {hit.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-secondary/55">
                    {hit.categories.join(" · ")}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                  {formatCatalogPrice(hit.price)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
