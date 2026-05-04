"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type CategoryOption = { value: string; label: string };

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type CategoryMenuProps = {
  value: string;
  options: CategoryOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function CategoryMenu({
  value,
  options,
  onChange,
  disabled,
}: CategoryMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const buttonId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);

  const selected = options[selectedIndex] ?? options[0];

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    });
  }, []);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, options.length, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    setHighlightedIndex(selectedIndex);
  }, [selectedIndex, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(options.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const opt = options[highlightedIndex];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, highlightedIndex, options, onChange]);

  function toggle() {
    if (disabled) return;
    setOpen((o) => !o);
  }

  function choose(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const listbox =
    mounted && open ? (
      createPortal(
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className="fixed z-[300] box-border max-h-[min(40vh,280px)] overflow-y-auto rounded-lg border border-secondary/20 bg-white py-1 shadow-lg outline-none"
          style={{
            top: coords.top,
            left: coords.left,
            width: coords.width,
            minWidth: coords.width > 0 ? coords.width : undefined,
          }}
        >
          {options.map((opt, i) => {
            const active = i === highlightedIndex;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                id={`${listId}-opt-${i}`}
                data-active={active}
                className={`cursor-pointer px-4 py-2.5 text-left text-sm transition-colors ${
                  active
                    ? "bg-secondary text-white"
                    : isSelected
                      ? "bg-secondary/10 font-medium text-secondary"
                      : "text-secondary hover:bg-secondary/10"
                }`}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(opt.value)}
              >
                {opt.label}
              </div>
            );
          })}
        </div>,
        document.body,
      )
    ) : null;

  return (
    <div className="relative flex min-h-full min-w-0 flex-1">
      <button
        ref={triggerRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-label="Category"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => toggle()}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) setOpen(true);
            if (e.key === "ArrowDown") {
              setHighlightedIndex((i) => Math.min(options.length - 1, i + 1));
            } else {
              setHighlightedIndex((i) => Math.max(0, i - 1));
            }
          }
        }}
        className="flex min-h-12 w-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 bg-transparent px-3 py-3 text-left text-[15px] text-secondary outline-none transition-colors hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-60 min-[420px]:min-h-full min-[420px]:w-[min(100%,11rem)] min-[420px]:flex-none min-[420px]:py-3 min-[420px]:pl-4 min-[420px]:pr-3 min-[420px]:text-sm sm:min-h-[3rem] focus-visible:z-10 focus-visible:bg-muted/25 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary/40"
      >
        <span className="min-w-0 truncate">{selected?.label ?? "—"}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-secondary/55 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {listbox}
    </div>
  );
}
