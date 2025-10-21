"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { JobPositionDoc, WithStringId } from "@/lib/types";

interface JobCardProps {
  job: WithStringId<JobPositionDoc>;
}

const formatCount = (items?: unknown[]) => (items ? items.length : 0);

export const JobCard = ({ job }: JobCardProps) => (
  <article className="flex min-w-[18rem] max-w-[20rem] shrink-0 snap-center flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div>
      <h3 className="text-base font-semibold text-slate-100">{job.positionName}</h3>
      {job.subtitle && <p className="mt-1 text-xs text-slate-400">{job.subtitle}</p>}
    </div>

    <div className="flex flex-wrap gap-2 text-xs">
      <Badge color="emerald">Compétences : {formatCount(job.requiredSkills)}</Badge>
      <Badge color="violet">Projets : {formatCount(job.projects)}</Badge>
    </div>

    <div className="mt-auto flex justify-end">
      <Link
        href={`/admin/jobs/${job._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </div>
  </article>
);

export default JobCard;
