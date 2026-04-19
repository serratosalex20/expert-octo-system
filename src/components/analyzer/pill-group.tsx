"use client";

import { cn } from "@/lib/utils";

interface PillGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: PillGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg bg-white/[0.04] p-1 border border-white/[0.08]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              active
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
