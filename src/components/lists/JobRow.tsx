"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { JobPositionDoc, WithStringId } from "@/lib/types";

interface JobRowProps {
  job: WithStringId<JobPositionDoc>;
}

const formatCount = (items?: unknown[]) => (items ? items.length : 0);

export const JobRow = ({ job }: JobRowProps) => (
  <tr className="transition hover:bg-slate-800/40">
    <td className="px-4 py-3" data-label="Poste">
      <div className="font-medium text-slate-100">{job.positionName}</div>
      {job.subtitle && <p className="mt-1 text-xs text-slate-400">{job.subtitle}</p>}
    </td>
    <td className="px-4 py-3" data-label="Synthèse">
      <div className="flex flex-wrap gap-2">
        <Badge color="emerald">Compétences : {formatCount(job.requiredSkills)}</Badge>
        <Badge color="violet">Projets : {formatCount(job.projects)}</Badge>
      </div>
    </td>
    <td className="px-4 py-3 text-right" data-label="Actions" data-align="end">
      <Link
        href={`/admin/jobs/${job._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </td>
  </tr>
);

export default JobRow;
