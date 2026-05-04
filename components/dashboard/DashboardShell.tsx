"use client";

import type { ReactNode } from "react";

import { useState } from "react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="dashboard-root flex h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-muted/35">
      <DashboardSidebar open={sidebarOpen} onNavigate={closeSidebar} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pt-4 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-6 sm:ps-6 sm:pe-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pt-8 lg:ps-8 lg:pe-8 lg:pb-[max(2rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
