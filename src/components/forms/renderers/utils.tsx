import type { ControlElement, ControlProps, JsonSchema } from "@jsonforms/core";

export interface AsyncOptionsConfig {
  url: string;
  valuePath: string;
  labelPath: string;
}

type LabelValue = ControlProps["label"];

const labelToString = (label: LabelValue | undefined): string | undefined => {
  if (typeof label === "string") {
    return label;
  }
  if (label && typeof label === "object" && "text" in label) {
    const text = (label as { text?: unknown }).text;
    return typeof text === "string" ? text : undefined;
  }
  return undefined;
};

export const resolveLabel = (props: ControlProps): string => {
  const direct = labelToString(props.label);
  if (direct) {
    return direct;
  }
  const control = props.uischema as ControlElement;
  const schema = props.schema as JsonSchema;
  const controlLabel = labelToString(control?.label as LabelValue);
  if (controlLabel) {
    return controlLabel;
  }
  const schemaTitle = typeof schema?.title === "string" ? schema.title : undefined;
  return schemaTitle ?? props.path;
};

export const controlOptions = <T extends Record<string, unknown> | undefined>(
  props: ControlProps,
): T | undefined => {
  const control = props.uischema as ControlElement | undefined;
  if (!control || typeof control !== "object") {
    return undefined;
  }
  const options = control.options;
  return (options as T | undefined) ?? undefined;
};

export const renderErrors = (error?: string | null, formError?: string) => {
  if (!error && !formError) {
    return null;
  }
  return <p className="text-xs text-red-400">{error ?? formError}</p>;
};

const baseInputClassCore =
  "rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export const baseInputClass = `${baseInputClassCore} py-2`;
export const baseSelectClass = `${baseInputClassCore} py-2.5`;

export const fieldLabelClass = "text-sm font-medium text-slate-100";
export const fieldDescriptionClass = "text-xs text-slate-300";
export const fieldErrorClass = "text-xs text-red-400";
