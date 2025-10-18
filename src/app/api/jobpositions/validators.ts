import type {
  CreateJobPositionPayload,
  UpdateJobPositionPayload,
} from "@/lib/types";
import { isValidObjectId, toObjectId } from "@/lib/ids";

export class BadRequestError extends Error {}

export const parseJobCreate = (
  body: Record<string, unknown>,
): CreateJobPositionPayload => {
  const positionName = getRequiredString(
    body.positionName,
    "L'intitulé du poste est requis.",
  );

  const payload: CreateJobPositionPayload = {
    positionName,
  };

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = getOptionalString(body.thumbnailPic, "thumbnailPic");
  }

  if ("subtitle" in body) {
    payload.subtitle = getOptionalString(body.subtitle, "subtitle");
  }

  if ("requiredSkills" in body) {
    payload.requiredSkills = getOptionalSkills(body.requiredSkills);
  }

  if ("projects" in body) {
    payload.projects = getOptionalProjectIds(body.projects);
  }

  return payload;
};

export const parseJobUpdate = (
  body: Record<string, unknown>,
): UpdateJobPositionPayload => {
  const payload: UpdateJobPositionPayload = {};

  if ("positionName" in body) {
    payload.positionName = getOptionalString(body.positionName, "positionName");
  }

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = getOptionalString(body.thumbnailPic, "thumbnailPic");
  }

  if ("subtitle" in body) {
    payload.subtitle = getOptionalString(body.subtitle, "subtitle");
  }

  if ("requiredSkills" in body) {
    payload.requiredSkills = getOptionalSkills(body.requiredSkills);
  }

  if ("projects" in body) {
    payload.projects = getOptionalProjectIds(body.projects);
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

const getOptionalSkills = (value: unknown) => {
  if (value == null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError(
      "Le champ requiredSkills doit être un tableau d'objets.",
    );
  }
  return value.map((entry, index) => parseSkill(entry, index));
};

const parseSkill = (value: unknown, index: number) => {
  if (typeof value !== "object" || value == null) {
    throw new BadRequestError(
      `L'entrée ${index + 1} de requiredSkills doit être un objet.`,
    );
  }

  const record = value as Record<string, unknown>;
  const skillId = record.skillId;
  const minLevel = record.minLevel;
  const priority = record.priority;

  if (typeof skillId !== "string" || !isValidObjectId(skillId)) {
    throw new BadRequestError(
      `L'entrée ${index + 1} doit contenir un skillId valide.`,
    );
  }

  return {
    skillId: toObjectId(skillId),
    minLevel: getLevelValue(minLevel, index, "minLevel"),
    priority: getLevelValue(priority, index, "priority"),
  };
};

const getLevelValue = (value: unknown, index: number, field: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError(
      `Le champ ${field} de l'entrée ${index + 1} doit être compris entre 1 et 5.`,
    );
  }
  return parsed as 1 | 2 | 3 | 4 | 5;
};

const getOptionalProjectIds = (value: unknown) => {
  if (value == null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new BadRequestError("Le champ projects doit être un tableau.");
  }
  const ids = value.map((entry, index) => {
    if (typeof entry !== "string" || !isValidObjectId(entry)) {
      throw new BadRequestError(
        `Le projet ${index + 1} doit être un identifiant valide.`,
      );
    }
    return toObjectId(entry);
  });
  const uniqueIds = Array.from(new Map(ids.map((id) => [id.toString(), id])).values());
  return uniqueIds;
};
