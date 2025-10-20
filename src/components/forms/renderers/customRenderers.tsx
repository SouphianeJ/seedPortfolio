"use client";

import type { ReactNode } from "react";
import {
  generateDefaultUISchema,
  isBooleanControl,
  isDateControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isObjectArrayControl,
  isPrimitiveArrayControl,
  isStringControl,
  rankWith,
  uiTypeIs,
  type ControlProps,
  type JsonFormsRendererRegistryEntry,
  type JsonSchema,
  type LayoutProps,
  type UISchemaElement,
} from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsControlProps, withJsonFormsLayoutProps } from "@jsonforms/react";
import { baseInputClass, controlOptions, fieldDescriptionClass, fieldErrorClass, fieldLabelClass, resolveLabel } from "./utils";

interface DetailOption extends Record<string, unknown> {
  detail?: UISchemaElement;
}

const Section = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-1">{children}</div>
);

const FieldLabel = ({
  id,
  label,
  required,
}: {
  id: string;
  label: string;
  required?: boolean;
}) => (
  <label className={fieldLabelClass} htmlFor={id}>
    {label}
    {required ? " *" : ""}
  </label>
);

const Description = ({ description }: { description?: string }) =>
  description ? <p className={fieldDescriptionClass}>{description}</p> : null;

const ErrorMessage = ({ error }: { error?: string }) =>
  error ? <p className={fieldErrorClass}>{error}</p> : null;

const TextControl = (props: ControlProps) => {
  const { data, handleChange, path, id, required, description, enabled, visible } = props;
  if (!visible) {
    return null;
  }

  const options = controlOptions<{ multi?: boolean } | undefined>(props);
  const isTextArea = Boolean(options?.multi);
  const label = resolveLabel(props);
  const value = data ?? "";

  return (
    <Section>
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      {isTextArea ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => handleChange(path, event.target.value || undefined)}
          className={`${baseInputClass} min-h-28`}
          disabled={!enabled}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => handleChange(path, event.target.value || undefined)}
          className={baseInputClass}
          disabled={!enabled}
        />
      )}
      <ErrorMessage error={props.errors} />
    </Section>
  );
};

const EnumControl = (props: ControlProps) => {
  const { data, handleChange, path, id, required, description, enabled, visible, schema } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const options = Array.isArray((schema as JsonSchema)?.enum) ? ((schema as JsonSchema).enum as unknown[]) : [];
  const value = data ?? "";

  return (
    <Section>
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      <select
        id={id}
        value={value}
        onChange={(event) => handleChange(path, event.target.value || undefined)}
        className={baseInputClass}
        disabled={!enabled}
      >
        <option value="" disabled={required}>
          Sélectionnez une valeur
        </option>
        {options.map((option) => (
          <option key={String(option)} value={String(option)}>
            {String(option)}
          </option>
        ))}
      </select>
      <ErrorMessage error={props.errors} />
    </Section>
  );
};

const NumberControl = (props: ControlProps) => {
  const { data, handleChange, path, id, required, description, enabled, visible, schema } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const value = data ?? "";
  const schemaNumber = schema as JsonSchema | undefined;
  const type = Array.isArray(schemaNumber?.type)
    ? (schemaNumber?.type as string[])[0]
    : (schemaNumber?.type as string | undefined);
  const step = type === "integer" ? 1 : schemaNumber?.multipleOf;

  return (
    <Section>
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      <input
        id={id}
        type="number"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "") {
            handleChange(path, undefined);
            return;
          }
          const parsed = type === "integer" ? parseInt(next, 10) : Number(next);
          handleChange(path, Number.isNaN(parsed) ? undefined : parsed);
        }}
        className={baseInputClass}
        disabled={!enabled}
        step={step}
        min={schemaNumber?.minimum as number | undefined}
        max={schemaNumber?.maximum as number | undefined}
      />
      <ErrorMessage error={props.errors} />
    </Section>
  );
};

const BooleanControl = (props: ControlProps) => {
  const { data, handleChange, path, id, description, enabled, visible } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const checked = Boolean(data);

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm text-slate-100" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => handleChange(path, event.target.checked)}
          className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-indigo-500 focus:outline-none"
          disabled={!enabled}
        />
        {label}
      </label>
      <Description description={description} />
      <ErrorMessage error={props.errors} />
    </div>
  );
};

const DateControl = (props: ControlProps) => {
  const { data, handleChange, path, id, required, description, enabled, visible } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const value = data ?? "";

  return (
    <Section>
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => handleChange(path, event.target.value || undefined)}
        className={baseInputClass}
        disabled={!enabled}
      />
      <ErrorMessage error={props.errors} />
    </Section>
  );
};

const deriveDefaultValue = (schema: JsonSchema | undefined): unknown => {
  if (!schema) {
    return "";
  }
  if (schema.default !== undefined) {
    return schema.default;
  }
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (type) {
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
};

const PrimitiveArrayControl = (props: ControlProps) => {
  const { data, handleChange, path, id, description, enabled, visible, required, schema } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const value: unknown[] = Array.isArray(data) ? data : [];
  const itemsSchema = (schema as JsonSchema | undefined)?.items as JsonSchema | undefined;
  const itemEnum = Array.isArray(itemsSchema?.enum) ? (itemsSchema?.enum as unknown[]) : undefined;
  const itemType = Array.isArray(itemsSchema?.type)
    ? (itemsSchema?.type as string[])[0]
    : (itemsSchema?.type as string | undefined);

  const addItem = () => {
    const next = [...value, itemEnum?.[0] ?? deriveDefaultValue(itemsSchema)];
    handleChange(path, next);
  };

  const updateItem = (index: number, nextValue: unknown) => {
    const next = value.map((entry, entryIndex) => (entryIndex === index ? nextValue : entry));
    handleChange(path, next);
  };

  const removeItem = (index: number) => {
    const next = value.filter((_, entryIndex) => entryIndex !== index);
    handleChange(path, next);
  };

  const renderInput = (entry: unknown, index: number) => {
    if (itemEnum) {
      const selected = entry == null ? "" : String(entry);
      return (
        <select
          className={baseInputClass}
          value={selected}
          onChange={(event) => updateItem(index, event.target.value || undefined)}
          disabled={!enabled}
        >
          <option value="">Sélectionnez une valeur</option>
          {itemEnum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      );
    }

    if (itemType === "number" || itemType === "integer") {
      const numericValue = entry === undefined || entry === null ? "" : String(entry);
      return (
        <input
          type="number"
          className={baseInputClass}
          value={numericValue}
          onChange={(event) =>
            updateItem(index, event.target.value === "" ? undefined : Number(event.target.value))
          }
          disabled={!enabled}
        />
      );
    }

    return (
      <input
        type="text"
        className={baseInputClass}
        value={entry == null ? "" : String(entry)}
        onChange={(event) => updateItem(index, event.target.value || undefined)}
        disabled={!enabled}
      />
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      <div className="flex flex-col gap-2">
        {value.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun élément</p>
        ) : (
          value.map((entry, index) => (
            <div
              key={`${id}-${index}`}
              className="flex flex-col gap-2 rounded-md border border-slate-700 bg-slate-900/40 p-3"
            >
              {renderInput(entry, index)}
              <button
                type="button"
                className="self-start rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                onClick={() => removeItem(index)}
                disabled={!enabled}
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        className="self-start rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-200 hover:bg-indigo-500/20"
        onClick={addItem}
        disabled={!enabled}
      >
        Ajouter
      </button>
      <ErrorMessage error={props.errors} />
    </div>
  );
};

const ObjectArrayControl = (props: ControlProps) => {
  const { data, handleChange, path, id, description, enabled, visible, required, schema, renderers, cells } = props;
  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);
  const value: unknown[] = Array.isArray(data) ? data : [];
  const itemsSchema = (schema as JsonSchema | undefined)?.items as JsonSchema | undefined;
  const options = controlOptions<DetailOption | undefined>(props);
  const detail = options?.detail ?? (itemsSchema ? generateDefaultUISchema(itemsSchema) : undefined);

  const addItem = () => {
    const next = [...value, deriveDefaultValue(itemsSchema)];
    handleChange(path, next);
  };

  const removeItem = (index: number) => {
    const next = value.filter((_, entryIndex) => entryIndex !== index);
    handleChange(path, next);
  };

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel id={id} label={label} required={required} />
      <Description description={description} />
      <div className="flex flex-col gap-3">
        {value.length === 0 ? (
          <p className="text-xs text-slate-400">Aucun élément</p>
        ) : (
          value.map((_, index) => (
            <div
              key={`${id}-${index}`}
              className="flex flex-col gap-3 rounded-md border border-slate-700 bg-slate-900/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Élément {index + 1}</span>
                <button
                  type="button"
                  className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                  onClick={() => removeItem(index)}
                  disabled={!enabled}
                >
                  Supprimer
                </button>
              </div>
              {detail && (
                <JsonFormsDispatch
                  schema={itemsSchema ?? { type: "object" }}
                  uischema={detail}
                  path={`${path}.${index}`}
                  enabled={enabled}
                  renderers={renderers}
                  cells={cells}
                />
              )}
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        className="self-start rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs text-indigo-200 hover:bg-indigo-500/20"
        onClick={addItem}
        disabled={!enabled}
      >
        Ajouter
      </button>
      <ErrorMessage error={props.errors} />
    </div>
  );
};

const VerticalLayout = (props: LayoutProps) => {
  if (!props.visible) {
    return null;
  }
  const layout = props.uischema;
  if (!("elements" in layout)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      {layout.elements?.map((element, index) => (
        <JsonFormsDispatch
          key={`vertical-${props.path}-${index}`}
          schema={props.schema}
          uischema={element}
          path={props.path}
          enabled={props.enabled}
          renderers={props.renderers}
          cells={props.cells}
        />
      ))}
    </div>
  );
};

const HorizontalLayout = (props: LayoutProps) => {
  if (!props.visible) {
    return null;
  }
  const layout = props.uischema;
  if (!("elements" in layout)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {layout.elements?.map((element, index) => (
        <div key={`horizontal-${props.path}-${index}`} className="flex-1">
          <JsonFormsDispatch
            schema={props.schema}
            uischema={element}
            path={props.path}
            enabled={props.enabled}
            renderers={props.renderers}
            cells={props.cells}
          />
        </div>
      ))}
    </div>
  );
};

const GroupLayout = (props: LayoutProps) => {
  if (!props.visible) {
    return null;
  }
  const layout = props.uischema;
  if (!("elements" in layout)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      {"label" in layout && layout.label ? (
        <h3 className="text-sm font-semibold text-slate-200">{layout.label}</h3>
      ) : null}
      <div className="flex flex-col gap-4">
        {layout.elements?.map((element, index) => (
          <JsonFormsDispatch
            key={`group-${props.path}-${index}`}
            schema={props.schema}
            uischema={element}
            path={props.path}
            enabled={props.enabled}
            renderers={props.renderers}
            cells={props.cells}
          />
        ))}
      </div>
    </div>
  );
};

const textControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(1, isStringControl),
  renderer: withJsonFormsControlProps(TextControl),
};

const enumControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(4, isEnumControl),
  renderer: withJsonFormsControlProps(EnumControl),
};

const numberControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, isNumberControl),
  renderer: withJsonFormsControlProps(NumberControl),
};

const integerControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(4, isIntegerControl),
  renderer: withJsonFormsControlProps(NumberControl),
};

const booleanControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, isBooleanControl),
  renderer: withJsonFormsControlProps(BooleanControl),
};

const dateControlEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(4, isDateControl),
  renderer: withJsonFormsControlProps(DateControl),
};

const primitiveArrayEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, isPrimitiveArrayControl),
  renderer: withJsonFormsControlProps(PrimitiveArrayControl),
};

const objectArrayEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(5, isObjectArrayControl),
  renderer: withJsonFormsControlProps(ObjectArrayControl),
};

const verticalLayoutEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, uiTypeIs("VerticalLayout")),
  renderer: withJsonFormsLayoutProps(VerticalLayout),
};

const horizontalLayoutEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, uiTypeIs("HorizontalLayout")),
  renderer: withJsonFormsLayoutProps(HorizontalLayout),
};

const groupLayoutEntry: JsonFormsRendererRegistryEntry = {
  tester: rankWith(3, uiTypeIs("Group")),
  renderer: withJsonFormsLayoutProps(GroupLayout),
};

export const customRenderers: JsonFormsRendererRegistryEntry[] = [
  groupLayoutEntry,
  horizontalLayoutEntry,
  verticalLayoutEntry,
  objectArrayEntry,
  primitiveArrayEntry,
  enumControlEntry,
  dateControlEntry,
  integerControlEntry,
  numberControlEntry,
  booleanControlEntry,
  textControlEntry,
];
