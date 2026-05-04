import type { ReactNode } from "react";

/**
 * Shared content column for header, main catalog, and footer.
 * Scales from narrow phones (320px+) through ultra-wide (~2000px).
 */
export function CatalogWidth({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-full px-3 min-[360px]:px-4 sm:max-w-6xl sm:px-5 2xl:max-w-7xl min-[1800px]:max-w-[90rem] min-[1800px]:px-6 ${className}`}
    >
      {children}
    </div>
  );
}
