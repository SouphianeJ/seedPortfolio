"use client";

import { useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { createJob } from "@/hooks/useJobs";
import type { CreateJobPositionPayload } from "@/lib/types";
import jobSchema from "@/schemas/jobpositions.schema.json";
import jobUiSchema from "@/schemas/jobpositions.uischema.json";

const schema = jobSchema as JsonSchema;
const uiSchema = jobUiSchema as UISchemaElement;

export default function NewJobPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createJob(data as unknown as CreateJobPositionPayload);
    router.push("/admin/jobs");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau poste"
        description="Définissez un poste et les compétences nécessaires."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/jobs")}
      />
    </div>
  );
}
