import type { CreateProjectPayload, RoleKey, UpdateProjectPayload } from "@/lib/types";
import { jobpositions } from "@/lib/mongodb";
import { BadRequestError } from "@/lib/parsers/objectid";

const getRoleSet = async (): Promise<Set<string>> => {
  const collection = await jobpositions();
  const cursor = collection.find({}, { projection: { positionName: 1 } });
  const roles = new Set<string>();
  for await (const document of cursor) {
    if (document?.positionName) {
      roles.add(document.positionName);
    }
  }
  return roles;
};

const sanitizeString = (value: unknown, field: string, required = false) => {
  if (typeof value !== "string") {
    if (required) {
      throw new BadRequestError(`Le champ ${field} est requis.`);
    }
    return undefined;
  }
  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new BadRequestError(`Le champ ${field} est requis.`);
  }
  return trimmed || undefined;
};

const parseYear = (value: unknown, required: boolean) => {
  if (value == null && !required) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestError("Le champ year doit être un entier.");
  }
  return parsed;
};

const parseRoles = async (value: unknown, required: boolean): Promise<RoleKey[] | undefined> => {
  if (value == null) {
    if (required) {
      throw new BadRequestError("Au moins un rôle est requis.");
    }
    return undefined;
  }
  if (!Array.isArray(value) || value.length === 0) {
    if (required) {
      throw new BadRequestError("Au moins un rôle est requis.");
    }
    return [];
  }
  const roleSet = await getRoleSet();
  const roles = value.filter((role): role is RoleKey => typeof role === "string" && roleSet.has(role));
  if (required && roles.length === 0) {
    throw new BadRequestError("Rôles invalides (doivent exister dans JobPositions).");
  }
  return Array.from(new Set(roles));
};

export const parseProjectCreate = async (
  body: Record<string, unknown>,
): Promise<CreateProjectPayload> => {
  const projectName = sanitizeString(body.projectName, "projectName", true)!;
  const year = parseYear(body.year, true)!;
  const roles = await parseRoles(body.roles, true) as RoleKey[];

  const payload: CreateProjectPayload = {
    projectName,
    year,
    roles,
  };

  payload.thumbnailPic = sanitizeString(body.thumbnailPic, "thumbnailPic");
  payload.shortDescription = sanitizeString(body.shortDescription, "shortDescription");

  return payload;
};

export const parseProjectUpdate = async (
  body: Record<string, unknown>,
): Promise<UpdateProjectPayload> => {
  const payload: UpdateProjectPayload = {};

  if ("projectName" in body) {
    payload.projectName = sanitizeString(body.projectName, "projectName") ?? undefined;
  }

  if ("year" in body) {
    payload.year = parseYear(body.year, false);
  }

  if ("roles" in body) {
    payload.roles = await parseRoles(body.roles, false);
  }

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = sanitizeString(body.thumbnailPic, "thumbnailPic");
  }

  if ("shortDescription" in body) {
    payload.shortDescription = sanitizeString(body.shortDescription, "shortDescription");
  }

  return payload;
};
