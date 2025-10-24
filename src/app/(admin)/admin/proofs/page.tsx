"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Table from "@/components/lists/Table";
import EmptyState from "@/components/ui/EmptyState";
import ProofRow from "@/components/lists/ProofRow";
import { useProofs } from "@/hooks/useProofs";

const buttonClasses =
  "inline-flex items-center rounded-md border border-sky-500 bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400";

export default function ProofsPage() {
  const {
    proofs,
    isLoading,
    error,
  } = useProofs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preuves"
        description="Centralisez les preuves de vos réalisations (captures d'écran, vidéos, liens, etc.)."
        actions={
          <Link href="/admin/proofs/new" className={buttonClasses}>
            Nouvelle preuve
          </Link>
        }
      />

      {isLoading && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
          Chargement des preuves...
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          title="Impossible de charger les preuves"
          description="Un problème est survenu lors de la récupération des données."
          action={
            <Link href="/admin/proofs/new" className={buttonClasses}>
              Ajouter une preuve
            </Link>
          }
        />
      )}

      {!isLoading && !error && proofs.length === 0 && (
        <EmptyState
          title="Aucune preuve"
          description="Ajoutez votre première preuve pour enrichir vos projets."
          action={
            <Link href="/admin/proofs/new" className={buttonClasses}>
              Nouvelle preuve
            </Link>
          }
        />
      )}

      {!isLoading && !error && proofs.length > 0 && (
        <Table headers={["Nom", "Type", "Lien", "Actions"]}>
          {proofs.map((proof) => (
            <ProofRow key={proof._id} proof={proof} />
          ))}
        </Table>
      )}
    </div>
  );
}
