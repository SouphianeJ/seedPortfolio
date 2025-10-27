"use client";

import type { ReactNode } from "react";

interface TableProps {
  headers?: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
}

export const Table = ({ headers = [], children, emptyMessage }: TableProps) => {
  const isEmpty = Array.isArray(children) ? children.length === 0 : false;

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-center text-sm text-slate-300 sm:p-6">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="responsive-table">
      <div className="table-container overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          {headers.length > 0 ? (
            <thead className="bg-slate-900 text-left uppercase tracking-wide text-slate-400">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-2 py-2 font-medium sm:px-4 sm:py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody className="bg-slate-900/60 text-slate-100 md:divide-y md:divide-slate-800">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
