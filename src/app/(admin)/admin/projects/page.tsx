"use client";

import { useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Table from "@/components/lists/Table";
import ProjectRow from "@/components/lists/ProjectRow";
import EmptyState from "@/components/ui/EmptyState";
import { useProjects } from "@/hooks/useProjects";
import { useExpertises } from "@/hooks/useExpertises";
import { useTools } from "@/hooks/useTools";
import { useJobs } from "@/hooks/useJobs";
import { useProofs } from "@/hooks/useProofs";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ProjectsPage() {
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const { jobs, isLoading: jobsLoading, error: jobsError } = useJobs();
  const {
    expertises,
    isLoading: expertisesLoading,
    error: expertisesError,
  } = useExpertises();
  const { tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const {
    proofs,
    isLoading: proofsLoading,
    error: proofsError,
  } = useProofs();

  const expertiseMap = useMemo(() => {
    const map = new Map<string, string>();
    expertises.forEach((expertise) => {
      map.set(expertise._id, expertise.expertiseName);
    });
    return map;
  }, [expertises]);

  const toolMap = useMemo(() => {
    const map = new Map<string, string>();
    tools.forEach((tool) => {
      map.set(tool._id, tool.toolName);
    });
    return map;
  }, [tools]);

  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    jobs.forEach((job) => {
      map.set(job._id, job.positionName);
    });
    return map;
  }, [jobs]);

  const proofMap = useMemo(() => {
    const map = new Map<string, (typeof proofs)[number]>();
    proofs.forEach((proof) => {
      map.set(proof._id, proof);
    });
    return map;
  }, [proofs]);

  const isLoading =
    projectsLoading ||
    expertisesLoading ||
    toolsLoading ||
    jobsLoading ||
    proofsLoading;
  const error =
    projectsError ??
    expertisesError ??
    toolsError ??
    jobsError ??
    proofsError;

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
          headers={[
            "Nom",
            "Année",
            "Rôles",
            "Expertises",
            "Outils",
            "Top Facts & Figures",
            "Preuves",
            "Actions",
          ]}
        >
          {projects.map((project) => {
            const expertiseNames = (project.expertises ?? [])
              .map((expertiseId) => expertiseMap.get(expertiseId))
              .filter((name): name is string => Boolean(name));
            const toolNames = (project.tools ?? [])
              .map((toolId) => toolMap.get(toolId))
              .filter((name): name is string => Boolean(name));
            const projectProofs = (project.proofs ?? [])
              .map((proofId) => proofMap.get(proofId))
              .filter((proof): proof is NonNullable<typeof proof> => Boolean(proof));

            return (
              <ProjectRow
                key={project._id}
                project={project}
                roleNames={project.roles.map(
                  (roleId) => roleMap.get(roleId) ?? roleId,
                )}
                expertiseNames={expertiseNames}
                toolNames={toolNames}
                proofs={projectProofs}
              />
            );
          })}
        </Table>
      )}
    </div>
  );
}
