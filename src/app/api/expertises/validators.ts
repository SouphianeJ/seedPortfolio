import type {
  CreateExpertisePayload,
  ExpertiseDoc,
  SkillCategory,
} from "@/lib/types";
import { jobpositions } from "@/lib/mongodb";
import { BadRequestError, toObjectIdArray } from "@/lib/parsers/objectid";
export { BadRequestError } from "@/lib/parsers/objectid";

const CATEGORY_VALUES: SkillCategory[] = [
  "Gestion de projet",
  "Ingénierie pédago",
  "Web/API",
  "Data/IA",
  "Plateforme",
];

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

const getRequiredString = (value: unknown, message: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestError(message);
  }
  return value.trim();
};

const getOptionalString = (value: unknown, field: string) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  return value.trim();
};

const getRequiredLevel = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError("Le niveau doit être compris entre 1 et 5.");
  }
  return parsed as CreateExpertisePayload["level"];
};

const getOptionalLevel = (value: unknown) => {
  if (value == null) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError("Le niveau doit être compris entre 1 et 5.");
  }
  return parsed as CreateExpertisePayload["level"];
};

const parseRoles = (
  value: unknown,
  roles: Set<string>,
  field: string,
  { required }: { required: boolean },
): ExpertiseDoc["rolesPriority"] | undefined => {
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
  const uniqueMap = new Map<string, (typeof entries)[number]>();
  entries.forEach((entry) => {
    uniqueMap.set(entry.toString(), entry);
  });
  const unique = Array.from(uniqueMap.values());
  const missing = unique.filter((entry) => !roles.has(entry.toString()));
  if (missing.length > 0) {
    throw new BadRequestError(
      `Certains rôles référencés dans ${field} n'existent pas: ${missing
        .map((entry) => entry.toString())
        .join(", ")}.`,
    );
  }
  return unique;
};

const getOptionalCategory = (value: unknown) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError("Le champ category doit être une chaîne.");
  }
  if (!CATEGORY_VALUES.includes(value as SkillCategory)) {
    throw new BadRequestError("Catégorie inconnue.");
  }
  return value as SkillCategory;
};

export const parseExpertiseCreate = async (
  body: Record<string, unknown>,
): Promise<Omit<ExpertiseDoc, "_id">> => {
  const expertiseName = getRequiredString(
    body.expertiseName,
    "Le nom de l'expertise est requis.",
  );
  const level = getRequiredLevel(body.level);
  const roleSet = await getRoleIdSet();
  const rolesPriority = parseRoles(body.rolesPriority, roleSet, "rolesPriority", {
    required: true,
  }) ?? [];

  const payload: Omit<ExpertiseDoc, "_id"> = {
    expertiseName,
    level,
    rolesPriority,
  };

  if (typeof body.category === "string" && CATEGORY_VALUES.includes(body.category as SkillCategory)) {
    payload.category = body.category as SkillCategory;
  }

  if (typeof body.lastUsed === "string" && body.lastUsed.trim()) {
    payload.lastUsed = body.lastUsed.trim();
  }

  return payload;
};

export const parseExpertiseUpdate = async (
  body: Record<string, unknown>,
): Promise<Partial<Omit<ExpertiseDoc, "_id">>> => {
  const payload: Partial<Omit<ExpertiseDoc, "_id">> = {};

  if ("expertiseName" in body) {
    payload.expertiseName = getOptionalString(body.expertiseName, "expertiseName");
  }

  if ("level" in body) {
    payload.level = getOptionalLevel(body.level);
  }

  if ("rolesPriority" in body) {
    const roleSet = await getRoleIdSet();
    payload.rolesPriority = parseRoles(body.rolesPriority, roleSet, "rolesPriority", {
      required: false,
    });
  }

  if ("category" in body) {
    payload.category = getOptionalCategory(body.category);
  }

  if ("lastUsed" in body) {
    payload.lastUsed = getOptionalString(body.lastUsed, "lastUsed");
  }

  return payload;
};
