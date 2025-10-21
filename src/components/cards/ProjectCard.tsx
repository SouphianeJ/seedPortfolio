"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { SerializedProject } from "@/lib/serializers";

interface ProjectCardProps {
  project: SerializedProject;
  expertiseNames?: string[];
  toolNames?: string[];
}

export const ProjectCard = ({
  project,
  expertiseNames = [],
  toolNames = [],
}: ProjectCardProps) => (
  <article className="flex min-w-[18rem] max-w-[22rem] shrink-0 snap-center flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-slate-100">{project.projectName}</h3>
        {project.isKeyProjet && <Badge color="gold">Projet clé</Badge>}
      </div>
      {project.shortDescription && (
        <p className="text-xs text-slate-400">{project.shortDescription}</p>
      )}
    </div>

    <div className="flex flex-wrap gap-3 text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <span className="font-semibold uppercase tracking-wide text-slate-400">Année</span>
        <span className="rounded-md border border-slate-700 px-2 py-0.5 text-slate-100">{project.year}</span>
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rôles</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {project.roles.map((role) => (
          <Badge key={role} color="sky">
            {role}
          </Badge>
        ))}
      </div>
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Expertises</p>
      {expertiseNames.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {expertiseNames.map((expertise) => (
            <Badge key={expertise} color="violet">
              {expertise}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Outils</p>
      {toolNames.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {toolNames.map((tool) => (
            <Badge key={tool} color="pearl">
              {tool}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400">Non renseigné</span>
      )}
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Top Facts & Figures</p>
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
    </div>

    <div className="mt-auto flex justify-end">
      <Link
        href={`/admin/projects/${project._id}/edit`}
        className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
      >
        Éditer
      </Link>
    </div>
  </article>
);

export default ProjectCard;
