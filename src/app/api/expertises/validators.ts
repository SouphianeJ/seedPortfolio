import type {
  CreateExpertisePayload,
  SkillCategory,
  UpdateExpertisePayload,
} from "@/lib/types";
import { jobpositions } from "@/lib/mongodb";
import { BadRequestError } from "@/lib/parsers/objectid";

const CATEGORY_VALUES: SkillCategory[] = [
  "Gestion de projet",
  "Ingénierie pédago",
  "Web/API",
  "Data/IA",
  "Plateforme",
];

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

const filterRoles = (
  value: unknown,
  roles: Set<string>,
  required: boolean,
): CreateExpertisePayload["rolesPriority"] | undefined => {
  if (value == null) {
    if (required) {
      throw new BadRequestError("Au moins un rôle est requis.");
    }
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError("Le champ rolesPriority doit être un tableau.");
  }
  const filtered = value.filter((role): role is CreateExpertisePayload["rolesPriority"][number] =>
    typeof role === "string" && roles.has(role),
  );
  if (required && filtered.length === 0) {
    throw new BadRequestError("Les rôles fournis sont invalides.");
  }
  return Array.from(new Set(filtered));
};

export const parseExpertiseCreate = async (
  body: Record<string, unknown>,
): Promise<CreateExpertisePayload> => {
  const roleSet = await getRoleSet();
  const expertiseName = getRequiredString(
    body.expertiseName,
    "Le nom de l'expertise est requis.",
  );
  const level = getRequiredLevel(body.level);
  const rolesPriority = filterRoles(body.rolesPriority, roleSet, true) as CreateExpertisePayload["rolesPriority"];

  const payload: CreateExpertisePayload = {
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
): Promise<UpdateExpertisePayload> => {
  const payload: UpdateExpertisePayload = {};
  const roleSet = await getRoleSet();

  if ("expertiseName" in body) {
    payload.expertiseName = getOptionalString(body.expertiseName, "expertiseName");
  }

  if ("level" in body) {
    payload.level = getOptionalLevel(body.level);
  }

  if ("rolesPriority" in body) {
    payload.rolesPriority = filterRoles(body.rolesPriority, roleSet, false);
  }

  if ("category" in body) {
    payload.category = getOptionalCategory(body.category);
  }

  if ("lastUsed" in body) {
    payload.lastUsed = getOptionalString(body.lastUsed, "lastUsed");
  }

  return payload;
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
