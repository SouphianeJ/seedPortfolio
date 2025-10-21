"use client";

import { useEffect, useMemo, useState } from "react";
import { JsonForms } from "@jsonforms/react";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import SubmitBar from "./SubmitBar";
import { formRenderers } from "./renderers";

interface JsonAutoFormProps {
  schema: JsonSchema;
  uiSchema?: UISchemaElement;
  data?: unknown;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const JsonAutoForm = ({
  schema,
  uiSchema,
  data,
  onSubmit,
  onCancel,
  submitLabel,
}: JsonAutoFormProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    (data as Record<string, unknown>) ?? {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const renderers = useMemo(() => [...formRenderers], []);

  useEffect(() => {
    setFormData((data as Record<string, unknown>) ?? {});
  }, [data]);

  const handleChange = ({ data }: { data: unknown }) => {
    setFormData((data ?? {}) as Record<string, unknown>);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="jsonforms-app">
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          renderers={renderers}
          cells={[]}
          onChange={handleChange}
        />
      </div>
      {formError && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      )}
      <SubmitBar submitting={submitting} onCancel={onCancel} submitLabel={submitLabel} />
    </form>
  );
};

export default JsonAutoForm;
