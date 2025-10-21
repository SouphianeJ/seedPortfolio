"use client";

import { useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Table from "@/components/lists/Table";
import ProjectRow from "@/components/lists/ProjectRow";
import EmptyState from "@/components/ui/EmptyState";
import { useProjects } from "@/hooks/useProjects";
import { useExpertises } from "@/hooks/useExpertises";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ProjectsPage() {
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    expertises,
    isLoading: expertisesLoading,
    error: expertisesError,
  } = useExpertises();

  const expertiseMap = useMemo(() => {
    const map = new Map<string, string>();
    expertises.forEach((expertise) => {
      map.set(expertise._id, expertise.expertiseName);
    });
    return map;
  }, [expertises]);

  const isLoading = projectsLoading || expertisesLoading;
  const error = projectsError ?? expertisesError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description="Suivez les projets disponibles et mettez à jour leurs métadonnées."
        actions={
          <Link href="/admin/projects/new" className={buttonClasses}>
            Nouveau projet
          </Link>
        }
      />

      {isLoading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
          Chargement des projets...
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          title="Impossible de charger les projets"
          description="Un problème est survenu lors de la récupération des données."
          action={
            <Link href="/admin/projects/new" className={buttonClasses}>
              Ajouter un projet
            </Link>
          }
        />
      )}

      {!isLoading && !error && projects.length === 0 && (
        <EmptyState
          title="Aucun projet"
          description="Ajoutez votre premier projet pour alimenter la base de données."
          action={
            <Link href="/admin/projects/new" className={buttonClasses}>
              Nouveau projet
            </Link>
          }
        />
      )}

      {!isLoading && !error && projects.length > 0 && (
        <Table
          headers={["Nom", "Année", "Rôles", "Expertises", "Top Facts & Figures", "Actions"]}
        >
          {projects.map((project) => {
            const expertiseNames = (project.expertises ?? [])
              .map((expertiseId) => expertiseMap.get(expertiseId))
              .filter((name): name is string => Boolean(name));

            return (
              <ProjectRow
                key={project._id}
                project={project}
                expertiseNames={expertiseNames}
              />
            );
          })}
        </Table>
      )}
    </div>
  );
}
