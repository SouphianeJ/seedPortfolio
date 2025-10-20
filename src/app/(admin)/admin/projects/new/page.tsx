"use client";

import { useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { createProject } from "@/hooks/useProjects";
import type { CreateProjectPayload } from "@/lib/types";
import projectsSchema from "@/schemas/projects.schema.json";
import projectsUiSchema from "@/schemas/projects.uischema.json";

const schema = projectsSchema as JsonSchema;
const uiSchema = projectsUiSchema as UISchemaElement;

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createProject(data as unknown as CreateProjectPayload);
    router.push("/admin/projects");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau projet"
        description="Créez un projet à partir du schéma JSON Forms."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/projects")}
      />
    </div>
  );
}
