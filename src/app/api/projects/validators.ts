import type {
  CreateProjectPayload,
  RoleKey,
  UpdateProjectPayload,
} from "@/lib/types";

export class BadRequestError extends Error {}

const ROLE_VALUES: RoleKey[] = [
  "Ingénierie pédagogique",
  "Administrateur Moodle",
  "Développeur web",
  "Chef de projet",
];

export const parseProjectCreate = (
  body: Record<string, unknown>,
): CreateProjectPayload => {
  const projectName = getRequiredString(body.projectName, "Le nom du projet est requis.");
  const year = getRequiredInteger(body.year, "L'année est requise.");
  const roles = getRequiredRoles(body.roles);

  const payload: CreateProjectPayload = {
    projectName,
    year,
    roles,
  };

  if (typeof body.thumbnailPic === "string" && body.thumbnailPic.trim()) {
    payload.thumbnailPic = body.thumbnailPic.trim();
  }

  if (typeof body.shortDescription === "string" && body.shortDescription.trim()) {
    payload.shortDescription = body.shortDescription.trim();
  }

  return payload;
};

export const parseProjectUpdate = (
  body: Record<string, unknown>,
): UpdateProjectPayload => {
  const payload: UpdateProjectPayload = {};

  if ("projectName" in body) {
    payload.projectName = getOptionalString(body.projectName, "projectName");
  }

  if ("year" in body) {
    payload.year = getOptionalInteger(body.year, "year");
  }

  if ("roles" in body) {
    payload.roles = getOptionalRoles(body.roles);
  }

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = getOptionalString(body.thumbnailPic, "thumbnailPic");
  }

  if ("shortDescription" in body) {
    payload.shortDescription = getOptionalString(body.shortDescription, "shortDescription");
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

const getRequiredInteger = (value: unknown, message: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestError(message);
  }
  return parsed;
};

const getOptionalInteger = (value: unknown, field: string) => {
  if (value == null) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new BadRequestError(`Le champ ${field} doit être un entier.`);
  }
  return parsed;
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
    throw new BadRequestError("Le champ roles doit être un tableau.");
  }
  const roles = value.filter((role): role is RoleKey =>
    typeof role === "string" && ROLE_VALUES.includes(role as RoleKey),
  );
  return Array.from(new Set(roles));
};
