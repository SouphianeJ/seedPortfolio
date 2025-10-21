"use client";

import { useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { createTool } from "@/hooks/useTools";
import type { CreateToolPayload } from "@/lib/types";
import toolsSchema from "@/schemas/tools.schema.json";
import toolsUiSchema from "@/schemas/tools.uischema.json";

const schema = toolsSchema as JsonSchema;
const uiSchema = toolsUiSchema as UISchemaElement;

export default function NewToolPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createTool(data as CreateToolPayload);
    router.push("/admin/tools");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel outil"
        description="Ajoutez un outil ou une technologie pour les projets."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/tools")}
      />
    </div>
  );
}
