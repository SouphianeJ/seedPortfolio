"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
      {description && <p className="text-sm text-slate-300">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
