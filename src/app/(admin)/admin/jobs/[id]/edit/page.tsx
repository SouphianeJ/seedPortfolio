"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateJob, useJob } from "@/hooks/useJobs";
import type { UpdateJobPositionPayload } from "@/lib/types";
import jobSchema from "@/schemas/jobpositions.schema.json";
import jobUiSchema from "@/schemas/jobpositions.uischema.json";

const schema = jobSchema as JsonSchema;
const uiSchema = jobUiSchema as UISchemaElement;

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, error, isLoading } = useJob(id ?? null);

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
    await updateJob(id, formData as UpdateJobPositionPayload);
    router.push("/admin/jobs");
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Identifiant de poste manquant dans l&apos;URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Chargement du poste...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Impossible de charger le poste demandé.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Aucun poste trouvé.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Éditer : ${data.positionName}`}
        description="Mettez à jour les compétences requises ou les projets associés."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        data={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/jobs")}
      />
    </div>
  );
}
