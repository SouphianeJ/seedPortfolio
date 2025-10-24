"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateProof, useProof } from "@/hooks/useProofs";
import type { UpdateProofPayload } from "@/lib/types";
import proofsSchema from "@/schemas/proofs.schema.json";
import proofsUiSchema from "@/schemas/proofs.uischema.json";

const schema = proofsSchema as JsonSchema;
const uiSchema = proofsUiSchema as UISchemaElement;

export default function EditProofPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, error, isLoading } = useProof(id ?? null);

  const initialData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const { _id: _unused, ...rest } = data;
    void _unused;
    return rest;
  }, [data]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (!id) {
      throw new Error("Identifiant manquant.");
    }
    await updateProof(id, formData as UpdateProofPayload);
    router.push("/admin/proofs");
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Identifiant de la preuve manquant dans l&apos;URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Chargement de la preuve...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Impossible de charger la preuve demandée.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Aucune preuve trouvée.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Éditer : ${data.proofName}`}
        description="Mettez à jour les informations de cette preuve."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        data={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/proofs")}
      />
    </div>
  );
}
