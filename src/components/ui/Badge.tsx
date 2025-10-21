"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "sky" | "slate" | "emerald" | "violet" | "gold" | "pearl";
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  slate: "bg-slate-500/20 text-slate-200 border-slate-500/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  violet: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  gold: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  pearl: "bg-slate-100/10 text-slate-100 border-slate-200/30",
};

export const Badge = ({ children, color = "slate" }: BadgeProps) => (
  <span
    className={`inline-flex items-center justify-center whitespace-pre-line break-words rounded-full border px-3 py-1 text-xs font-medium leading-tight text-center ${colorMap[color]}`}
  >
    {children}
  </span>
);

export default Badge;
