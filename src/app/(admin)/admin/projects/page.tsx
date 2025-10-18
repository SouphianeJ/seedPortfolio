"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Table from "@/components/lists/Table";
import ProjectRow from "@/components/lists/ProjectRow";
import EmptyState from "@/components/ui/EmptyState";
import { useProjects } from "@/hooks/useProjects";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects();

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
        <Table headers={["Nom", "Année", "Rôles", "Actions"]}>
          {projects.map((project) => (
            <ProjectRow key={project._id} project={project} />
          ))}
        </Table>
      )}
    </div>
  );
}
