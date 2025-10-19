import { ObjectId } from "mongodb";
import type {
  CreateJobPositionPayload,
  UpdateJobPositionPayload,
} from "@/lib/types";
import { expertises, jobpositions, projects } from "@/lib/mongodb";
import {
  BadRequestError,
  toObjectId,
  toObjectIdArray,
} from "@/lib/parsers/objectid";

type CollectionFactory = () => Promise<{ countDocuments: (filter: Record<string, unknown>) => Promise<number> }>;

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

const assertEnum = (value: unknown, roles: Set<string>, field: string) => {
  if (typeof value !== "string" || !roles.has(value)) {
    throw new BadRequestError(
      `Le champ ${field} doit être l'un des rôles existants: ${Array.from(roles).join(" | ")}.`,
    );
  }
};

const assertLevel = (value: unknown, field: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new BadRequestError(`Le champ ${field} doit être un entier entre 1 et 5.`);
  }
  return parsed as 1 | 2 | 3 | 4 | 5;
};

const assertExistAll = async (
  ids: ObjectId[] | undefined,
  factory: CollectionFactory,
  label: string,
) => {
  if (!ids?.length) {
    return;
  }
  const collection = await factory();
  const found = await collection.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    throw new BadRequestError(`Certains ${label} référencés n'existent pas.`);
  }
};

export const parseJobPositionCreate = async (
  body: Record<string, unknown>,
): Promise<CreateJobPositionPayload> => {
  const roleSet = await getRoleSet();
  const positionName = body.positionName;
  assertEnum(positionName, roleSet, "positionName");

  const payload: CreateJobPositionPayload = {
    positionName: positionName as string,
  };

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = getOptionalString(body.thumbnailPic, "thumbnailPic");
  }

  if ("subtitle" in body) {
    payload.subtitle = getOptionalString(body.subtitle, "subtitle");
  }

  if (Array.isArray(body.requiredSkills)) {
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
  }

  if (body.projects != null) {
    payload.projects = toObjectIdArray(body.projects, "projects");
  }

  await assertExistAll(payload.requiredSkills?.map((skill) => skill.skillId), expertises, "expertises (skillId)");
  await assertExistAll(payload.projects, projects, "projects");

  return payload;
};

export const parseJobPositionUpdate = async (
  body: Record<string, unknown>,
): Promise<UpdateJobPositionPayload> => {
  const payload: UpdateJobPositionPayload = {};
  const roleSet = await getRoleSet();

  if ("positionName" in body) {
    assertEnum(body.positionName, roleSet, "positionName");
    payload.positionName = body.positionName as string;
  }

  if ("thumbnailPic" in body) {
    payload.thumbnailPic = getOptionalString(body.thumbnailPic, "thumbnailPic");
  }

  if ("subtitle" in body) {
    payload.subtitle = getOptionalString(body.subtitle, "subtitle");
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

const getOptionalString = (value: unknown, field: string) => {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};
