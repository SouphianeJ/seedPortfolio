"use client";

import type { ReactNode } from "react";

interface TableProps {
  headers: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
}

export const Table = ({ headers, children, emptyMessage }: TableProps) => {
  const isEmpty = Array.isArray(children) ? children.length === 0 : false;

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="min-w-full table-fixed divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900 text-left uppercase tracking-wide text-slate-400">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-100">
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
