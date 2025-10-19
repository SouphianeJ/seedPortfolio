import { jobpositions } from "@/lib/mongodb";
import type { CreateProjectPayload, RoleKey, UpdateProjectPayload } from "@/lib/types";
import { BadRequestError } from "@/lib/parsers/objectid";

const getRoleSet = async (): Promise<Set<string>> => {
  const collection = await jobpositions();
  const cursor = collection.find({}, { projection: { positionName: 1 } });
  const roles = new Set<string>();
  for await (const doc of cursor) {
    if (doc?.positionName) {
      roles.add(doc.positionName);
    }
  }
  return roles;
};

const normalizeString = (value: unknown, field: string, required = false) => {
  if (value == null) {
    if (required) {
      throw new BadRequestError(`${field} requis.`);
    }
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new BadRequestError(`${field} requis.`);
  }
  return trimmed || undefined;
};

const normalizeYear = (value: unknown, required: boolean) => {
  if (value == null) {
    if (required) {
      throw new BadRequestError("year requis.");
    }
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestError("year doit être un entier.");
  }
  return parsed;
};

const normalizeRoles = async (value: unknown, required: boolean): Promise<RoleKey[] | undefined> => {
  if (value == null) {
    if (required) {
      throw new BadRequestError("Au moins un rôle est requis.");
    }
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError("roles doit être un tableau.");
  }
  const roles = await getRoleSet();
  const filtered = value.filter((role): role is RoleKey => typeof role === "string" && roles.has(role));
  if (required && filtered.length === 0) {
    throw new BadRequestError("Rôles invalides (doivent exister dans JobPositions).");
  }
  return Array.from(new Set(filtered));
};

export const parseProjectCreate = async (
  body: Record<string, unknown>,
): Promise<CreateProjectPayload> => {
  const projectName = normalizeString(body.projectName, "projectName", true) as string;
  const year = normalizeYear(body.year, true) as number;
  const roles = (await normalizeRoles(body.roles, true)) as RoleKey[];

  const payload: CreateProjectPayload = {
    projectName,
    year,
    roles,
  };

  const thumbnailPic = normalizeString(body.thumbnailPic, "thumbnailPic");
  if (thumbnailPic) {
    payload.thumbnailPic = thumbnailPic;
  }

  const shortDescription = normalizeString(body.shortDescription, "shortDescription");
  if (shortDescription) {
    payload.shortDescription = shortDescription;
  }

  return payload;
};

export const parseProjectUpdate = async (
  body: Record<string, unknown>,
): Promise<UpdateProjectPayload> => {
  const payload: UpdateProjectPayload = {};

  if ("projectName" in body) {
    const value = normalizeString(body.projectName, "projectName");
    if (value !== undefined) {
      payload.projectName = value;
    }
  }

  if ("year" in body) {
    const value = normalizeYear(body.year, false);
    if (value !== undefined) {
      payload.year = value;
    }
  }

  if ("roles" in body) {
    payload.roles = await normalizeRoles(body.roles, false);
  }

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = normalizeString(body.thumbnailPic, "thumbnailPic");
  }

  if ("shortDescription" in body) {
    payload.shortDescription = normalizeString(body.shortDescription, "shortDescription");
  }

  return payload;
};
