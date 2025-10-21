"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ExpertiseDoc, WithStringId } from "@/lib/types";

interface ExpertiseCardProps {
  expertise: WithStringId<ExpertiseDoc>;
}

export const ExpertiseCard = ({ expertise }: ExpertiseCardProps) => (
  <article className="flex min-w-[18rem] max-w-[20rem] shrink-0 snap-center flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold text-slate-100">{expertise.expertiseName}</h3>
        {expertise.description && (
          <p className="mt-1 text-xs text-slate-400">{expertise.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge color="emerald">Niveau {expertise.level} / 5</Badge>
        {expertise.category && <Badge color="violet">{expertise.category}</Badge>}
        {expertise.lastUsed && (
          <Badge color="slate">Dernière utilisation : {expertise.lastUsed}</Badge>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Rôles prioritaires
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {expertise.rolesPriority.map((role) => (
          <Badge key={role} color="sky">
            {role}
          </Badge>
        ))}
      </div>
    </div>

    <div className="mt-auto flex justify-end">
      <Link
        href={`/admin/expertises/${expertise._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </div>
  </article>
);

export default ExpertiseCard;
