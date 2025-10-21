"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ToolDoc, WithStringId } from "@/lib/types";

interface ToolCardProps {
  tool: WithStringId<ToolDoc>;
}

export const ToolCard = ({ tool }: ToolCardProps) => (
  <article className="w-[85vw] max-w-[320px] rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-100">{tool.toolName}</h3>
        {tool.description && (
          <p className="text-sm text-slate-400">{tool.description}</p>
        )}
      </div>

      <Badge color="emerald">Niveau {tool.level} / 5</Badge>

      <div className="space-y-1 text-sm text-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Usage
        </span>
        {tool.usage ? (
          <p className="text-xs text-slate-300">{tool.usage}</p>
        ) : (
          <p className="text-xs text-slate-400">Non renseigné</p>
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
  </article>
);

export default ToolCard;
