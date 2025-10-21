"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { SerializedProject } from "@/lib/serializers";

interface ProjectCardProps {
  project: SerializedProject;
  expertiseNames?: string[];
  toolNames?: string[];
}

const SectionLabel = ({ label }: { label: string }) => (
  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
    {label}
  </span>
);

export const ProjectCard = ({
  project,
  expertiseNames = [],
  toolNames = [],
}: ProjectCardProps) => (
  <article className="w-[85vw] max-w-[360px] rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-100">
            {project.projectName}
          </h3>
          {project.shortDescription && (
            <p className="text-sm text-slate-400">{project.shortDescription}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <Badge color="slate">{project.year}</Badge>
          {project.isKeyProjet && <Badge color="gold">Projet clé</Badge>}
        </div>
      </div>

      <div className="space-y-3 text-sm text-slate-200">
        <div className="space-y-1">
          <SectionLabel label="Rôles" />
          <div className="flex flex-wrap gap-2">
            {project.roles.map((role) => (
              <Badge key={role} color="sky">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <SectionLabel label="Expertises" />
          {expertiseNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {expertiseNames.map((expertise) => (
                <Badge key={expertise} color="violet">
                  {expertise}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Non renseigné</p>
          )}
        </div>

        <div className="space-y-1">
          <SectionLabel label="Outils" />
          {toolNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {toolNames.map((tool) => (
                <Badge key={tool} color="pearl">
                  {tool}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Non renseigné</p>
          )}
        </div>

        <div className="space-y-1">
          <SectionLabel label="Top facts & figures" />
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
            <p className="text-xs text-slate-400">Non renseigné</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/admin/projects/${project._id}/edit`}
          className="inline-flex items-center rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300"
        >
          Éditer
        </Link>
      </div>
    </div>
  </article>
);

export default ProjectCard;
