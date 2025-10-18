"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateProject, useProject } from "@/hooks/useProjects";
import type { UpdateProjectPayload } from "@/lib/types";
import projectsSchema from "@/schemas/projects.schema.json";
import projectsUiSchema from "@/schemas/projects.uischema.json";

const schema = projectsSchema as JsonSchema;
const uiSchema = projectsUiSchema as UISchemaElement;

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, error, isLoading } = useProject(id ?? null);

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
    await updateProject(id, formData as UpdateProjectPayload);
    router.push("/admin/projects");
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Identifiant du projet manquant dans l&apos;URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Chargement du projet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Impossible de charger le projet demandé.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Aucun projet trouvé.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Éditer : ${data.projectName}`}
        description="Mettez à jour les informations du projet."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        data={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/projects")}
      />
    </div>
  );
}
