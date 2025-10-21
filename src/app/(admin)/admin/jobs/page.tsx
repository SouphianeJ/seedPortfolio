"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Table from "@/components/lists/Table";
import JobRow from "@/components/lists/JobRow";
import JobCard from "@/components/cards/JobCard";
import { useJobs } from "@/hooks/useJobs";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function JobsPage() {
  const { jobs, isLoading, error } = useJobs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postes"
        description="Associez vos postes aux compétences requises et projets associés."
        actions={
          <Link href="/admin/jobs/new" className={buttonClasses}>
            Nouveau poste
          </Link>
        }
      />

      {isLoading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
          Chargement des postes...
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          title="Impossible de charger les postes"
          description="Un problème est survenu lors de la récupération des données."
          action={
            <Link href="/admin/jobs/new" className={buttonClasses}>
              Ajouter un poste
            </Link>
          }
        />
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <EmptyState
          title="Aucun poste"
          description="Ajoutez un premier poste pour préparer vos offres."
          action={
            <Link href="/admin/jobs/new" className={buttonClasses}>
              Nouveau poste
            </Link>
          }
        />
      )}

      {!isLoading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          <div className="lg:hidden">
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex snap-x snap-mandatory gap-4 pb-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Table headers={["Poste", "Synthèse", "Actions"]}>
              {jobs.map((job) => (
                <JobRow key={job._id} job={job} />
              ))}
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
