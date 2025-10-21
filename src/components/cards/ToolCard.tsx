"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ToolDoc, WithStringId } from "@/lib/types";

interface ToolCardProps {
  tool: WithStringId<ToolDoc>;
}

export const ToolCard = ({ tool }: ToolCardProps) => (
  <article className="flex min-w-[18rem] max-w-[20rem] shrink-0 snap-center flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold text-slate-100">{tool.toolName}</h3>
        {tool.description && (
          <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
        )}
      </div>
      <Badge color="emerald">Niveau {tool.level} / 5</Badge>
    </div>

    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Usage</p>
      {tool.usage ? (
        <p className="mt-1 text-xs text-slate-300">{tool.usage}</p>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </div>

    <div className="mt-auto flex justify-end">
      <Link
        href={`/admin/tools/${tool._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </div>
  </article>
);

export default ToolCard;
