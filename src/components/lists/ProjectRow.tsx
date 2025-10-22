"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ExpandableText from "@/components/ui/ExpandableText";
import type { SerializedProject } from "@/lib/serializers";

interface ProjectRowProps {
  project: SerializedProject;
  roleNames?: string[];
  expertiseNames?: string[];
  toolNames?: string[];
}

export const ProjectRow = ({
  project,
  roleNames = [],
  expertiseNames = [],
  toolNames = [],
}: ProjectRowProps) => (
  <tr className="transition hover:bg-slate-800/40">
    <td className="px-2 py-3 sm:px-4" data-label="Nom">
      <div className="flex flex-wrap items-center gap-2">
        <div className="font-medium text-slate-100">{project.projectName}</div>
        {project.isKeyProjet && <Badge color="gold">Projet clé</Badge>}
      </div>
      {project.shortDescription && (
        <ExpandableText
          text={project.shortDescription}
          className="mt-1 text-xs text-slate-400"
        />
      )}
    </td>
    <td className="px-2 py-3 text-slate-200 sm:px-4" data-label="Année">
      {project.year}
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Rôles">
      {roleNames.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {roleNames.map((role) => (
            <Badge key={role} color="sky">
              {role}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Expertises">
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
    <td className="px-2 py-3 sm:px-4" data-label="Outils">
      {toolNames.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {toolNames.map((tool) => (
            <Badge key={tool} color="pearl">
              {tool}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </td>
    <td className="px-2 py-3 sm:px-4" data-label="Top Facts & Figures">
      {project.fireFacts.length > 0 ? (
        <ul className="space-y-1 text-xs text-slate-200">
          {project.fireFacts.map((fact, index) => (
            <li key={`${fact}-${index}`} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </td>
    <td className="px-2 py-3 text-right sm:px-4" data-label="Actions" data-align="end">
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
