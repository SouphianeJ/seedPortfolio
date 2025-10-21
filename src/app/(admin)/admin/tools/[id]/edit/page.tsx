"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { updateTool, useTool } from "@/hooks/useTools";
import type { UpdateToolPayload } from "@/lib/types";
import toolsSchema from "@/schemas/tools.schema.json";
import toolsUiSchema from "@/schemas/tools.uischema.json";

const schema = toolsSchema as JsonSchema;
const uiSchema = toolsUiSchema as UISchemaElement;

export default function EditToolPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const { data, error, isLoading } = useTool(id ?? null);

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
    await updateTool(id, formData as UpdateToolPayload);
    router.push("/admin/tools");
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Identifiant d&apos;outil manquant dans l&apos;URL.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Chargement de l&apos;outil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
        Impossible de charger l&apos;outil demandé.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        Aucun outil trouvé.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Éditer : ${data.toolName}`}
        description="Modifiez le niveau ou l'usage de l'outil."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        data={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/tools")}
      />
    </div>
  );
}
