"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ToolDoc, WithStringId } from "@/lib/types";

interface ToolRowProps {
  tool: WithStringId<ToolDoc>;
}

export const ToolRow = ({ tool }: ToolRowProps) =>
  Object.assign(
    <tr className="transition hover:bg-slate-800/40">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-100">{tool.toolName}</div>
        {tool.description && (
          <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge color="emerald">Niveau {tool.level} / 5</Badge>
      </td>
      <td className="px-4 py-3">
        {tool.usage ? (
          <p className="text-xs text-slate-300">{tool.usage}</p>
        ) : (
          <span className="text-xs text-slate-400">Non renseigné</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/tools/${tool._id}/edit`}
          className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
        >
          Éditer
        </Link>
      </td>
    </tr>,
    {
      mobileCard: (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-100">{tool.toolName}</div>
              {tool.description && (
                <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
              )}
            </div>
            <Badge color="emerald">Niveau {tool.level} / 5</Badge>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-medium uppercase tracking-wide text-slate-400">Usage</p>
            {tool.usage ? (
              <p className="text-slate-300">{tool.usage}</p>
            ) : (
              <span className="text-slate-400">Non renseigné</span>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href={`/admin/tools/${tool._id}/edit`}
              className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
            >
              Éditer
            </Link>
          </div>
        </div>
      ),
    },
  );

export default ToolRow;
