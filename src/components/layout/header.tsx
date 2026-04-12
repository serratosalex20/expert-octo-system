"use client";

import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search trades, tickers..."
          className="pl-9 bg-white/[0.04] border-white/[0.08] text-sm placeholder:text-slate-500 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Trade CTA */}
      <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30">
        <Plus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">New Trade</span>
      </Button>
    </header>
  );
}
