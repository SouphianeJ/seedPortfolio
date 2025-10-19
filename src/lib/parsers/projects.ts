import { jobpositions } from "@/lib/mongodb";
import type { CreateProjectPayload, RoleKey, UpdateProjectPayload } from "@/lib/types";
import { BadRequestError } from "@/lib/parsers/objectid";

const getRoleSet = async (): Promise<Set<string>> => {
  const collection = await jobpositions();
  const cursor = collection.find({}, { projection: { positionName: 1 } });
  const roles = new Set<string>();
  for await (const document of cursor) {
    if (document?.positionName) {
      roles.add(document.positionName as string);
    }
  }
  return roles;
};

const parseRoles = (
  value: unknown,
  roles: Set<string>,
  field: string,
  { required }: { required: boolean },
): RoleKey[] | undefined => {
  if (value == null) {
    if (required) {
      throw new BadRequestError(`Le champ ${field} est requis.`);
    }
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new BadRequestError(`Le champ ${field} doit être un tableau.`);
  }

  if (required && value.length === 0) {
    throw new BadRequestError(`Au moins un rôle est requis pour ${field}.`);
  }

  const seen = new Set<string>();
  const parsed: RoleKey[] = [];

  value.forEach((entry, index) => {
    if (typeof entry !== "string" || !roles.has(entry)) {
      throw new BadRequestError(
        `Le rôle ${entry as string} (${field}[${index}]) est inconnu. Les rôles doivent exister dans JobPositions.`,
      );
    }
    if (!seen.has(entry)) {
      seen.add(entry);
      parsed.push(entry as RoleKey);
    }
  });

  return parsed;
};

export const parseProjectCreate = async (
  body: Record<string, unknown>,
): Promise<CreateProjectPayload> => {
  const projectName =
    typeof body.projectName === "string" && body.projectName.trim()
      ? body.projectName.trim()
      : undefined;
  if (!projectName) {
    throw new BadRequestError("Le nom du projet est requis.");
  }

  const yearValue = Number(body.year);
  if (!Number.isInteger(yearValue)) {
    throw new BadRequestError("L'année doit être un entier.");
  }

  const roles = await getRoleSet();
  const parsedRoles = parseRoles(body.roles, roles, "roles", { required: true }) ?? [];

  const thumbnailPic =
    typeof body.thumbnailPic === "string" && body.thumbnailPic.trim()
      ? body.thumbnailPic.trim()
      : undefined;
  const shortDescription =
    typeof body.shortDescription === "string" && body.shortDescription.trim()
      ? body.shortDescription.trim()
      : undefined;

  return {
    projectName,
    year: yearValue,
    roles: parsedRoles,
    thumbnailPic,
    shortDescription,
  };
};

export const parseProjectUpdate = async (
  body: Record<string, unknown>,
): Promise<UpdateProjectPayload> => {
  const payload: UpdateProjectPayload = {};

  if ("projectName" in body && typeof body.projectName === "string") {
    const trimmed = body.projectName.trim();
    if (trimmed) {
      payload.projectName = trimmed;
    } else {
      payload.projectName = "";
    }
  }

  if ("year" in body) {
    if (body.year == null) {
      payload.year = undefined;
    } else {
      const yearValue = Number(body.year);
      if (!Number.isInteger(yearValue)) {
        throw new BadRequestError("Le champ year doit être un entier.");
      }
      payload.year = yearValue;
    }
  }

  if ("roles" in body) {
    const roles = await getRoleSet();
    payload.roles = parseRoles(body.roles, roles, "roles", { required: false });
  }

  if ("thumbnailPic" in body && typeof body.thumbnailPic === "string") {
    payload.thumbnailPic = body.thumbnailPic.trim() || undefined;
  }

  if ("shortDescription" in body && typeof body.shortDescription === "string") {
    payload.shortDescription = body.shortDescription.trim() || undefined;
  }

  return payload;
};
