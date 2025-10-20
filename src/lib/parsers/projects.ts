import { jobpositions } from "@/lib/mongodb";
import type { ProjectDoc } from "@/lib/types";
import { BadRequestError, toObjectIdArray } from "@/lib/parsers/objectid";

const getRoleIdSet = async (): Promise<Set<string>> => {
  const collection = await jobpositions();
  const cursor = collection.find({}, { projection: { _id: 1 } });
  const ids = new Set<string>();
  for await (const document of cursor) {
    const id = document?._id?.toString();
    if (id) {
      ids.add(id);
    }
  }
  return ids;
};

const parseRoles = (
  value: unknown,
  ids: Set<string>,
  field: string,
  { required }: { required: boolean },
): ProjectDoc["roles"] | undefined => {
  if (value == null) {
    if (required) {
      throw new BadRequestError(`Le champ ${field} est requis.`);
    }
    return undefined;
  }

  const entries = toObjectIdArray(value, field);

  if (required && entries.length === 0) {
    throw new BadRequestError(`Au moins un rôle est requis pour ${field}.`);
  }

  const uniqueMap = new Map<string, typeof entries[number]>();
  entries.forEach((entry) => {
    uniqueMap.set(entry.toString(), entry);
  });
  const unique = Array.from(uniqueMap.values());
  const missing = unique.filter((entry) => !ids.has(entry.toString()));
  if (missing.length > 0) {
    throw new BadRequestError(
      `Certains rôles référencés dans ${field} n'existent pas: ${missing
        .map((entry) => entry.toString())
        .join(", ")}.`,
    );
  }

  return unique;
};

export const parseProjectCreate = async (
  body: Record<string, unknown>,
): Promise<Omit<ProjectDoc, "_id">> => {
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

  const roleIds = await getRoleIdSet();
  const parsedRoles = parseRoles(body.roles, roleIds, "roles", { required: true }) ?? [];

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
): Promise<Partial<Omit<ProjectDoc, "_id">>> => {
  const payload: Partial<Omit<ProjectDoc, "_id">> = {};

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
    const ids = await getRoleIdSet();
    payload.roles = parseRoles(body.roles, ids, "roles", { required: false });
  }

  if ("thumbnailPic" in body && typeof body.thumbnailPic === "string") {
    payload.thumbnailPic = body.thumbnailPic.trim() || undefined;
  }

  if ("shortDescription" in body && typeof body.shortDescription === "string") {
    payload.shortDescription = body.shortDescription.trim() || undefined;
  }

  return payload;
};
