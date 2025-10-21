"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

interface TableProps {
  headers: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
}

type ResponsiveRowElement = ReactElement & { mobileCard?: ReactNode };

const isResponsiveRow = (
  child: ReactNode,
): child is ResponsiveRowElement =>
  isValidElement(child) && Object.prototype.hasOwnProperty.call(child, "mobileCard");

export const Table = ({ headers, children, emptyMessage }: TableProps) => {
  const rows = Children.toArray(children);
  const isEmpty = rows.length === 0;

  if (isEmpty && emptyMessage) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800">
      <div className="hidden overflow-x-auto md:block">
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
            {rows.map((row, index) =>
              isValidElement(row)
                ? cloneElement(row, {
                    key: row.key ?? index,
                  })
                : row,
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 bg-slate-900/60 p-4 text-sm text-slate-100 md:hidden">
        {rows.map((row, index) => {
          if (isResponsiveRow(row) && row.mobileCard) {
            return (
              <div key={row.key ?? index} className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
                {row.mobileCard}
              </div>
            );
          }

          if (isValidElement(row)) {
            const element = row as ReactElement<{ children?: ReactNode }>;
            return (
              <div key={row.key ?? index} className="space-y-3">
                {element.props.children}
              </div>
            );
          }

          return (
            <div key={index} className="text-slate-300">
              {row}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table;
