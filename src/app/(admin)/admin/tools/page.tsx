"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Table from "@/components/lists/Table";
import ToolRow from "@/components/lists/ToolRow";
import ToolCard from "@/components/lists/cards/ToolCard";
import { useTools } from "@/hooks/useTools";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ToolsPage() {
  const { tools, isLoading, error } = useTools();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outils"
        description="Référencez les outils et technologies disponibles."
        actions={
          <Link href="/admin/tools/new" className={buttonClasses}>
            Nouvel outil
          </Link>
        }
      />

      {isLoading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
          Chargement des outils...
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          title="Impossible de charger les outils"
          description="Un problème est survenu lors de la récupération des données."
          action={
            <Link href="/admin/tools/new" className={buttonClasses}>
              Ajouter un outil
            </Link>
          }
        />
      )}

      {!isLoading && !error && tools.length === 0 && (
        <EmptyState
          title="Aucun outil"
          description="Ajoutez un premier outil pour enrichir les fiches projets."
          action={
            <Link href="/admin/tools/new" className={buttonClasses}>
              Nouvel outil
            </Link>
          }
        />
      )}

      {!isLoading && !error && tools.length > 0 && (
        <Table
          headers={["Outil", "Niveau", "Usage", "Actions"]}
          mobileCards={tools.map((tool) => (
            <ToolCard key={`card-${tool._id}`} tool={tool} />
          ))}
        >
          {tools.map((tool) => (
            <ToolRow key={tool._id} tool={tool} />
          ))}
        </Table>
      )}
    </div>
  );
}
