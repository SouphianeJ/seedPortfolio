"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { JobPositionDoc, WithStringId } from "@/lib/types";

interface JobCardProps {
  job: WithStringId<JobPositionDoc>;
}

const formatCount = (items?: unknown[]) => (items ? items.length : 0);

export const JobCard = ({ job }: JobCardProps) => (
  <article className="w-[85vw] max-w-[320px] rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-100">{job.positionName}</h3>
        {job.subtitle && <p className="text-sm text-slate-400">{job.subtitle}</p>}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge color="emerald">Compétences : {formatCount(job.requiredSkills)}</Badge>
        <Badge color="violet">Projets : {formatCount(job.projects)}</Badge>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/admin/jobs/${job._id}/edit`}
          className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
        >
          Éditer
        </Link>
      </div>
    </div>
  </article>
);

export default JobCard;
