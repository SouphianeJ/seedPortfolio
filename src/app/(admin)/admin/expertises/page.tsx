"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Table from "@/components/lists/Table";
import ExpertiseRow from "@/components/lists/ExpertiseRow";
import ExpertiseCard from "@/components/cards/ExpertiseCard";
import { useExpertises } from "@/hooks/useExpertises";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ExpertisesPage() {
  const { expertises, isLoading, error } = useExpertises();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expertises"
        description="Définissez les domaines de compétences et leurs niveaux."
        actions={
          <Link href="/admin/expertises/new" className={buttonClasses}>
            Nouvelle expertise
          </Link>
        }
      />

      {isLoading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
          Chargement des expertises...
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          title="Impossible de charger les expertises"
          description="Un problème est survenu lors de la récupération des données."
          action={
            <Link href="/admin/expertises/new" className={buttonClasses}>
              Ajouter une expertise
            </Link>
          }
        />
      )}

      {!isLoading && !error && expertises.length === 0 && (
        <EmptyState
          title="Aucune expertise"
          description="Ajoutez une première expertise pour démarrer les analyses."
          action={
            <Link href="/admin/expertises/new" className={buttonClasses}>
              Nouvelle expertise
            </Link>
          }
        />
      )}

      {!isLoading && !error && expertises.length > 0 && (
        <div className="space-y-4">
          <div className="lg:hidden">
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex snap-x snap-mandatory gap-4 pb-4">
                {expertises.map((expertise) => (
                  <ExpertiseCard key={expertise._id} expertise={expertise} />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <Table headers={["Expertise", "Rôles prioritaires", "Actions"]}>
              {expertises.map((expertise) => (
                <ExpertiseRow key={expertise._id} expertise={expertise} />
              ))}
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
