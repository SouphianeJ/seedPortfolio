import { ObjectId, type Collection, type Document, type Filter } from "mongodb";
import { expertises, projects } from "@/lib/mongodb";
import type {
  CreateJobPositionPayload,
  UpdateJobPositionPayload,
} from "@/lib/types";
import {
  BadRequestError,
  toObjectId,
  toObjectIdArray,
} from "@/lib/parsers/objectid";

const getRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} est requis.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new BadRequestError(`Le champ ${field} ne peut pas être vide.`);
  }
  return trimmed;
};

const assertLevel = (value: unknown, field: string): 1 | 2 | 3 | 4 | 5 => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError(`Le champ ${field} doit être un entier entre 1 et 5.`);
  }
  return parsed as 1 | 2 | 3 | 4 | 5;
};

const assertExistAll = async <T extends Document>(
  ids: ObjectId[] | undefined,
  factory: () => Promise<Collection<T>>,
  label: string,
) => {
  if (!ids?.length) {
    return;
  }
  const collection = await factory();
  const filter: Filter<T> = { _id: { $in: ids } } as Filter<T>;
  const count = await collection.countDocuments(filter);
  if (count !== ids.length) {
    throw new BadRequestError(`Certains ${label} référencés n'existent pas.`);
  }
};

export const parseJobPositionCreate = async (
  body: Record<string, unknown>,
): Promise<CreateJobPositionPayload> => {
  const positionName = getRequiredString(body.positionName, "positionName");

  const thumbnailPic =
    typeof body.thumbnailPic === "string" && body.thumbnailPic.trim()
      ? body.thumbnailPic.trim()
      : undefined;

  const subtitle =
    typeof body.subtitle === "string" && body.subtitle.trim() ? body.subtitle.trim() : undefined;

  let requiredSkills: CreateJobPositionPayload["requiredSkills"];
  if (Array.isArray(body.requiredSkills)) {
    requiredSkills = body.requiredSkills.map((entry, index) => {
      if (typeof entry !== "object" || entry == null) {
        throw new BadRequestError(`requiredSkills[${index}] doit être un objet.`);
      }
      const record = entry as Record<string, unknown>;
      const skillId = toObjectId(record.skillId, `requiredSkills[${index}].skillId`);
      const minLevel = assertLevel(record.minLevel, `requiredSkills[${index}].minLevel`);
      const priority = assertLevel(record.priority, `requiredSkills[${index}].priority`);
      return { skillId, minLevel, priority };
    });
  }

  const projectIds = body.projects ? toObjectIdArray(body.projects, "projects") : undefined;

  await assertExistAll(
    requiredSkills?.map((skill) => skill.skillId),
    expertises,
    "expertises (skillId)",
  );
  await assertExistAll(projectIds, projects, "projects");

  return {
    positionName,
    requiredSkills,
    projects: projectIds,
    thumbnailPic,
    subtitle,
  };
};

export const parseJobPositionUpdate = async (
  body: Record<string, unknown>,
): Promise<UpdateJobPositionPayload> => {
  const payload: UpdateJobPositionPayload = {};

  if ("positionName" in body) {
    payload.positionName = getRequiredString(body.positionName, "positionName");
  }

  if ("thumbnailPic" in body && typeof body.thumbnailPic === "string") {
    payload.thumbnailPic = body.thumbnailPic.trim() || undefined;
  }

  if ("subtitle" in body && typeof body.subtitle === "string") {
    payload.subtitle = body.subtitle.trim() || undefined;
  }

  if ("requiredSkills" in body) {
    if (body.requiredSkills == null) {
      payload.requiredSkills = undefined;
    } else if (!Array.isArray(body.requiredSkills)) {
      throw new BadRequestError("requiredSkills doit être un tableau.");
    } else {
      payload.requiredSkills = body.requiredSkills.map((entry, index) => {
        if (typeof entry !== "object" || entry == null) {
          throw new BadRequestError(`requiredSkills[${index}] doit être un objet.`);
        }
        const record = entry as Record<string, unknown>;
        const skillId = toObjectId(record.skillId, `requiredSkills[${index}].skillId`);
        const minLevel = assertLevel(record.minLevel, `requiredSkills[${index}].minLevel`);
        const priority = assertLevel(record.priority, `requiredSkills[${index}].priority`);
        return { skillId, minLevel, priority };
      });
      await assertExistAll(
        payload.requiredSkills.map((skill) => skill.skillId),
        expertises,
        "expertises (skillId)",
      );
    }
  }

  if ("projects" in body) {
    if (body.projects == null) {
      payload.projects = undefined;
    } else {
      payload.projects = toObjectIdArray(body.projects, "projects");
      await assertExistAll(payload.projects, projects, "projects");
    }
  }

  return payload;
};
