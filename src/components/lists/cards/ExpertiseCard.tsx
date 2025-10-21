"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ExpertiseDoc, WithStringId } from "@/lib/types";

interface ExpertiseCardProps {
  expertise: WithStringId<ExpertiseDoc>;
}

export const ExpertiseCard = ({ expertise }: ExpertiseCardProps) => (
  <article className="w-[85vw] max-w-[340px] rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-100">{expertise.expertiseName}</h3>
        {expertise.description && (
          <p className="text-sm text-slate-400">{expertise.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge color="emerald">Niveau {expertise.level} / 5</Badge>
        {expertise.category && <Badge color="violet">{expertise.category}</Badge>}
        {expertise.lastUsed && (
          <Badge color="slate">Dernière utilisation : {expertise.lastUsed}</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-200">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Rôles prioritaires
        </span>
        <div className="flex flex-wrap gap-2">
          {expertise.rolesPriority.map((role) => (
            <Badge key={role} color="sky">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/admin/expertises/${expertise._id}/edit`}
          className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
        >
          Éditer
        </Link>
      </div>
    </div>
  </article>
);

export default ExpertiseCard;
