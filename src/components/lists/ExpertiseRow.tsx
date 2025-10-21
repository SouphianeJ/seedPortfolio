"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ExpertiseDoc, WithStringId } from "@/lib/types";

interface ExpertiseRowProps {
  expertise: WithStringId<ExpertiseDoc>;
}

export const ExpertiseRow = ({ expertise }: ExpertiseRowProps) => (
  <tr className="transition hover:bg-slate-800/40">
    <td className="px-4 py-3">
      <div className="font-medium text-slate-100">{expertise.expertiseName}</div>
      {expertise.description && (
        <p className="mt-1 text-xs text-slate-400">{expertise.description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge color="emerald">Niveau {expertise.level} / 5</Badge>
        {expertise.category && <Badge color="violet">{expertise.category}</Badge>}
        {expertise.lastUsed && (
          <Badge color="slate">Dernière utilisation : {expertise.lastUsed}</Badge>
        )}
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {expertise.rolesPriority.map((role) => (
          <Badge key={role} color="sky">
            {role}
          </Badge>
        ))}
      </div>
    </td>
    <td className="px-4 py-3 text-right">
      <Link
        href={`/admin/expertises/${expertise._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </td>
  </tr>
);

export default ExpertiseRow;
