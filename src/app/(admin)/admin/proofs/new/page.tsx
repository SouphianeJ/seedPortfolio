"use client";

import { useRouter } from "next/navigation";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import JsonAutoForm from "@/components/forms/JsonAutoForm";
import PageHeader from "@/components/ui/PageHeader";
import { createProof } from "@/hooks/useProofs";
import type { CreateProofPayload } from "@/lib/types";
import proofsSchema from "@/schemas/proofs.schema.json";
import proofsUiSchema from "@/schemas/proofs.uischema.json";

const schema = proofsSchema as JsonSchema;
const uiSchema = proofsUiSchema as UISchemaElement;

export default function NewProofPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    await createProof(data as CreateProofPayload);
    router.push("/admin/proofs");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle preuve"
        description="Ajoutez une preuve de réalisation pour valoriser vos projets."
      />
      <JsonAutoForm
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/proofs")}
      />
    </div>
  );
}
