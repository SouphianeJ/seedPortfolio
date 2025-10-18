"use client";

import type { ReactNode } from "react";

interface FieldHintProps {
  children: ReactNode;
}

export const FieldHint = ({ children }: FieldHintProps) => (
  <p className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
    {children}
  </p>
);

export default FieldHint;
