import type {
  CreateExpertisePayload,
  RoleKey,
  SkillCategory,
  UpdateExpertisePayload,
} from "@/lib/types";

export class BadRequestError extends Error {}

const ROLE_VALUES: RoleKey[] = [
  "Ingénierie pédagogique",
  "Administrateur Moodle",
  "Développeur web",
  "Chef de projet",
];

const CATEGORY_VALUES: SkillCategory[] = [
  "Gestion de projet",
  "Ingénierie pédago",
  "Web/API",
  "Data/IA",
  "Plateforme",
];

export const parseExpertiseCreate = (
  body: Record<string, unknown>,
): CreateExpertisePayload => {
  const expertiseName = getRequiredString(
    body.expertiseName,
    "Le nom de l'expertise est requis.",
  );
  const level = getRequiredLevel(body.level);
  const rolesPriority = getRequiredRoles(body.rolesPriority);

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

export const parseExpertiseUpdate = (
  body: Record<string, unknown>,
): UpdateExpertisePayload => {
  const payload: UpdateExpertisePayload = {};

  if ("expertiseName" in body) {
    payload.expertiseName = getOptionalString(body.expertiseName, "expertiseName");
  }

  if ("level" in body) {
    payload.level = getOptionalLevel(body.level);
  }

  if ("rolesPriority" in body) {
    payload.rolesPriority = getOptionalRoles(body.rolesPriority);
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

const getRequiredRoles = (value: unknown) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestError("Au moins un rôle est requis.");
  }
  const roles = value.filter((role): role is RoleKey =>
    typeof role === "string" && ROLE_VALUES.includes(role as RoleKey),
  );
  if (roles.length === 0) {
    throw new BadRequestError("Les rôles fournis sont invalides.");
  }
  return Array.from(new Set(roles));
};

const getOptionalRoles = (value: unknown) => {
  if (value == null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError("Le champ rolesPriority doit être un tableau.");
  }
  const roles = value.filter((role): role is RoleKey =>
    typeof role === "string" && ROLE_VALUES.includes(role as RoleKey),
  );
  return Array.from(new Set(roles));
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
