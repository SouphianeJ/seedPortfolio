"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateExpertise, useExpertise } from "@/hooks/useExpertises";
import type { UpdateExpertisePayload } from "@/lib/types";
import expertisesSchema from "@/schemas/expertises.schema.json";
import expertisesUiSchema from "@/schemas/expertises.uischema.json";

const schema = expertisesSchema as JsonSchema;
const uiSchema = expertisesUiSchema as UISchemaElement;

export default function EditExpertisePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, error, isLoading } = useExpertise(id ?? null);

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
    await updateExpertise(id, formData as unknown as UpdateExpertisePayload);
    router.push("/admin/expertises");
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Identifiant d&apos;expertise manquant dans l&apos;URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Chargement de l&apos;expertise...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Impossible de charger l&apos;expertise demandée.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Aucune expertise trouvée.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Éditer : ${data.expertiseName}`}
        description="Ajustez le niveau ou les rôles prioritaires."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        data={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/expertises")}
      />
    </div>
  );
}
