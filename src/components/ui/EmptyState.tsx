"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/30 px-8 py-16 text-center text-slate-300">
    <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
    {description && <p className="max-w-md text-sm text-slate-300">{description}</p>}
    {action && <div className="pt-2">{action}</div>}
  </div>
);

export default EmptyState;
