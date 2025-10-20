"use client";

import Link from "next/link";
import { useMemo } from "react";
import Badge from "@/components/ui/Badge";
import type { SerializedProject } from "@/lib/types";
import { useJobs } from "@/hooks/useJobs";

interface ProjectRowProps {
  project: SerializedProject;
}

export const ProjectRow = ({ project }: ProjectRowProps) => {
  const { jobs } = useJobs();
  const roleLabels = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach((job) => {
      map.set(job._id, job.positionName);
    });
    return map;
  }, [jobs]);

  return (
    <tr className="transition hover:bg-slate-800/40">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-100">{project.projectName}</div>
        {project.shortDescription && (
          <p className="mt-1 text-xs text-slate-400">{project.shortDescription}</p>
        )}
      </td>
      <td className="px-4 py-3 text-slate-200">{project.year}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {project.roles.map((roleId) => (
            <Badge key={roleId} color="sky">
              {roleLabels.get(roleId) ?? roleId}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/projects/${project._id}/edit`}
          className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
        >
          Éditer
        </Link>
      </td>
    </tr>
  );
};

export default ProjectRow;
