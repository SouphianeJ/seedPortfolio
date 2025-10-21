"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ExpandableText from "@/components/ui/ExpandableText";
import type { ToolDoc, WithStringId } from "@/lib/types";

interface ToolRowProps {
  tool: WithStringId<ToolDoc>;
}

export const ToolRow = ({ tool }: ToolRowProps) => (
  <tr className="transition hover:bg-slate-800/40">
    <td className="px-4 py-3" data-label="Outil">
      <div className="font-medium text-slate-100">{tool.toolName}</div>
      {tool.description && (
        <ExpandableText
          text={tool.description}
          className="mt-1 text-xs text-slate-400"
        />
      )}
    </td>
    <td className="px-4 py-3" data-label="Niveau">
      <Badge color="emerald">Niveau {tool.level} / 5</Badge>
    </td>
    <td className="px-4 py-3" data-label="Usage">
      {tool.usage ? (
        <ExpandableText
          text={tool.usage}
          className="text-xs text-slate-300"
        />
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </td>
    <td className="px-4 py-3 text-right" data-label="Actions" data-align="end">
      <Link
        href={`/admin/tools/${tool._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </td>
  </tr>
);

export default ToolRow;
