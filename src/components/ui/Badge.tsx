"use client";

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "sky" | "slate" | "emerald" | "violet";
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  slate: "bg-slate-500/20 text-slate-200 border-slate-500/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  violet: "bg-violet-500/20 text-violet-300 border-violet-500/40",
};

export const Badge = ({ children, color = "slate" }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorMap[color]}`}
  >
    {children}
  </span>
);

export default Badge;
