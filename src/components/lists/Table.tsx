"use client";

import type { ReactNode } from "react";

interface TableProps {
  headers: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
  mobileCards?: ReactNode[];
}

export const Table = ({
  headers,
  children,
  emptyMessage,
  mobileCards = [],
}: TableProps) => {
  const isEmpty = Array.isArray(children) ? children.length === 0 : false;
  const hasMobileCards = Array.isArray(mobileCards) ? mobileCards.length > 0 : false;

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  const tableContainerClassName = `overflow-x-auto rounded-lg border border-slate-800 ${
    hasMobileCards ? "hidden lg:block" : ""
  }`;

  return (
    <div className="space-y-4">
      <div className={tableContainerClassName}>
        <table className="min-w-full divide-y divide-slate-800 text-sm">
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

      {hasMobileCards && (
        <div className="-mx-2 lg:hidden">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pl-2 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {mobileCards.map((card, index) => (
              <div
                key={index}
                className="snap-start"
                style={{ flex: "0 0 auto" }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
