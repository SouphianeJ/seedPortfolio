import type { CreateToolPayload, UpdateToolPayload } from "@/lib/types";
import { BadRequestError } from "@/lib/parsers/objectid";

const getRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(`Le champ ${field} est requis.`);
  }
  return value.trim();
};

const getOptionalString = (value: unknown, field: string): string | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const getRequiredLevel = (value: unknown): CreateToolPayload["level"] => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError("Le niveau doit être compris entre 1 et 5.");
  }
  return parsed as CreateToolPayload["level"];
};

const getOptionalLevel = (value: unknown): CreateToolPayload["level"] | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError("Le niveau doit être compris entre 1 et 5.");
  }
  return parsed as CreateToolPayload["level"];
};

export const parseToolCreate = (
  body: Record<string, unknown>,
): CreateToolPayload => {
  const toolName = getRequiredString(body.toolName, "toolName");
  const level = getRequiredLevel(body.level);

  const payload: CreateToolPayload = {
    toolName,
    level,
  };

  const description = getOptionalString(body.description, "description");
  if (description) {
    payload.description = description;
  }

  const usage = getOptionalString(body.usage, "usage");
  if (usage) {
    payload.usage = usage;
  }

  return payload;
};

export const parseToolUpdate = (
  body: Record<string, unknown>,
): UpdateToolPayload => {
  const payload: UpdateToolPayload = {};

  if ("toolName" in body) {
    payload.toolName = getOptionalString(body.toolName, "toolName");
  }

  if ("level" in body) {
    payload.level = getOptionalLevel(body.level);
  }

  if ("description" in body) {
    const description = getOptionalString(body.description, "description");
    payload.description = description;
  }

  if ("usage" in body) {
    const usage = getOptionalString(body.usage, "usage");
    payload.usage = usage;
  }

  return payload;
};
