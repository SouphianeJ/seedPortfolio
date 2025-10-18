"use client";

import { useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { createExpertise } from "@/hooks/useExpertises";
import type { CreateExpertisePayload } from "@/lib/types";
import expertisesSchema from "@/schemas/expertises.schema.json";
import expertisesUiSchema from "@/schemas/expertises.uischema.json";

const schema = expertisesSchema as JsonSchema;
const uiSchema = expertisesUiSchema as UISchemaElement;

export default function NewExpertisePage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createExpertise(data as CreateExpertisePayload);
    router.push("/admin/expertises");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle expertise"
        description="Renseignez une nouvelle compétence clé."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/expertises")}
      />
    </div>
  );
}
