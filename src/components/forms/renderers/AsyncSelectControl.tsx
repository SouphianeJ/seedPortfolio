"use client";

import { useEffect, useState } from "react";
import type { ControlElement, JsonSchema, RankedTester, RendererEntry } from "@jsonforms/core";
import type { ControlProps } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

interface AsyncOptionsConfig {
  url: string;
  valuePath: string;
  labelPath: string;
}

interface Option {
  value: string;
  label: string;
}

const getByPath = (input: unknown, path: string): unknown => {
  if (!path) {
    return input;
  }
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, input);
};

const useAsyncOptions = (config: AsyncOptionsConfig | undefined) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      setOptions([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(config.url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const payload = await response.json();
        if (cancelled) {
          return;
        }
        if (!Array.isArray(payload)) {
          setOptions([]);
          return;
        }
        const mapped = payload
          .map<Option | null>((item) => {
            const rawValue = getByPath(item, config.valuePath);
            const rawLabel = getByPath(item, config.labelPath);
            if (rawValue == null || rawLabel == null) {
              return null;
            }
            return {
              value: String(rawValue),
              label: String(rawLabel),
            };
          })
          .filter((option): option is Option => option !== null);
        const unique = Array.from(new Map(mapped.map((opt) => [opt.value, opt])).values());
        setOptions(unique);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger les options.");
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [config?.labelPath, config?.url, config?.valuePath, config]);

  return { options, loading, error };
};

const renderErrors = (error?: string | null, formError?: string) => {
  if (!error && !formError) {
    return null;
  }
  return (
    <p className="text-xs text-red-400">
      {error ?? formError}
    </p>
  );
};

const resolveLabel = (props: ControlProps) => {
  if (props.label) {
    return props.label;
  }
  const control = props.uischema as ControlElement;
  const schema = props.schema as JsonSchema;
  return control?.label ?? schema?.title ?? props.path;
};

const asyncConfigFromUi = (uischema: ControlElement | undefined): AsyncOptionsConfig | undefined => {
  if (!uischema || typeof uischema !== "object") {
    return undefined;
  }
  const options = uischema.options as { asyncOptions?: AsyncOptionsConfig } | undefined;
  return options?.asyncOptions;
};

const isArrayOfStrings = (schema: JsonSchema | undefined): boolean => {
  return Boolean(
    schema &&
      schema.type === "array" &&
      typeof schema.items === "object" &&
      (schema.items as JsonSchema).type === "string",
  );
};

const isStringSchema = (schema: JsonSchema | undefined): boolean => schema?.type === "string";

const AsyncStringSelect = (props: ControlProps) => {
  const { uischema, data, handleChange, path, id, required, description, enabled, visible } = props;
  const config = asyncConfigFromUi(uischema as ControlElement);
  const { options, loading, error } = useAsyncOptions(config);

  if (!visible) {
    return null;
  }

  const label = resolveLabel(props);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-100" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      {description ? <p className="text-xs text-slate-300">{description}</p> : null}
      <select
        id={id}
        value={data ?? ""}
        onChange={(event) => handleChange(path, event.target.value || undefined)}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        disabled={!enabled || loading}
      >
        <option value="" disabled={required}>
          {loading ? "Chargement..." : "Sélectionnez une valeur"}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {renderErrors(error, props.errors)}
    </div>
  );
};

const AsyncArraySelect = (props: ControlProps) => {
  const { uischema, data, handleChange, path, id, required, description, enabled, visible } = props;
  const config = asyncConfigFromUi(uischema as ControlElement);
  const { options, loading, error } = useAsyncOptions(config);

  if (!visible) {
    return null;
  }

  const value: string[] = Array.isArray(data) ? data.map((entry) => String(entry)) : [];
  const label = resolveLabel(props);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    handleChange(path, selected);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-100" htmlFor={id}>
        {label}
        {required ? " *" : ""}
      </label>
      {description ? <p className="text-xs text-slate-300">{description}</p> : null}
      <select
        id={id}
        multiple
        value={value}
        onChange={handleSelectChange}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        disabled={!enabled || loading}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {renderErrors(error, props.errors)}
    </div>
  );
};

const arrayTester: RankedTester = (uischema, schema) => {
  if (!uischema || (uischema as ControlElement).type !== "Control") {
    return -1;
  }
  const control = uischema as ControlElement;
  const config = asyncConfigFromUi(control);
  if (!config) {
    return -1;
  }
  return isArrayOfStrings(schema as JsonSchema) ? 5 : -1;
};

const stringTester: RankedTester = (uischema, schema) => {
  if (!uischema || (uischema as ControlElement).type !== "Control") {
    return -1;
  }
  const control = uischema as ControlElement;
  const config = asyncConfigFromUi(control);
  if (!config) {
    return -1;
  }
  return isStringSchema(schema as JsonSchema) ? 5 : -1;
};

export const asyncArraySelectRenderer: RendererEntry = {
  tester: arrayTester,
  renderer: withJsonFormsControlProps(AsyncArraySelect),
};

export const asyncStringSelectRenderer: RendererEntry = {
  tester: stringTester,
  renderer: withJsonFormsControlProps(AsyncStringSelect),
};
