"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { SerializedProject } from "@/lib/serializers";

interface ProjectRowProps {
  project: SerializedProject;
  expertiseNames?: string[];
}

export const ProjectRow = ({ project, expertiseNames = [] }: ProjectRowProps) => (
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
        {project.roles.map((role) => (
          <Badge key={role} color="sky">
            {role}
          </Badge>
        ))}
      </div>
    </td>
    <td className="px-4 py-3">
      {expertiseNames.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {expertiseNames.map((expertise) => (
            <Badge key={expertise} color="violet">
              {expertise}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
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

export default ProjectRow;
