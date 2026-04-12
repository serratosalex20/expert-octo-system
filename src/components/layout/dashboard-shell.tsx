"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileSidebar } from "./mobile-sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar (sheet overlay) */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main content — CSS transition on margin for smooth sidebar collapse */}
      <div
        className={cn(
          "transition-[margin-left] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
        )}
      >
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
