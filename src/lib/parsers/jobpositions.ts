import { ObjectId } from "mongodb";
import { expertises, jobpositions, projects } from "@/lib/mongodb";
import type {
  CreateJobPositionPayload,
  UpdateJobPositionPayload,
} from "@/lib/types";
import {
  BadRequestError,
  toObjectId,
  toObjectIdArray,
} from "@/lib/parsers/objectid";

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

const assertEnum = (value: unknown, roles: Set<string>, field: string) => {
  if (typeof value !== "string" || !roles.has(value)) {
    throw new BadRequestError(
      `Le champ ${field} doit être l'un des roles existants: ${Array.from(roles).join(" | ")}.`,
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
  ids: ObjectId[],
  factory: () => Promise<{ countDocuments: (filter: unknown) => Promise<number> }>,
  name: string,
) => {
  if (!ids.length) {
    return;
  }
  const collection = await factory();
  const count = await collection.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new BadRequestError(`Certains ${name} référencés n'existent pas.`);
  }
};

export const parseJobPositionCreate = async (
  body: Record<string, unknown>,
): Promise<CreateJobPositionPayload> => {
  const roles = await getRoleSet();

  const positionName = body.positionName;
  assertEnum(positionName, roles, "positionName");

  const thumbnailPic =
    typeof body.thumbnailPic === "string" && body.thumbnailPic.trim()
      ? body.thumbnailPic.trim()
      : undefined;

  const subtitle =
    typeof body.subtitle === "string" && body.subtitle.trim() ? body.subtitle.trim() : undefined;

  let requiredSkills: CreateJobPositionPayload["requiredSkills"] = undefined;
  if (Array.isArray(body.requiredSkills)) {
    requiredSkills = body.requiredSkills.map((entry, index) => {
      if (typeof entry !== "object" || entry == null) {
        throw new BadRequestError(`requiredSkills[${index}] doit être un objet.`);
      }
      const skill = entry as Record<string, unknown>;
      const skillId = toObjectId(skill.skillId, `requiredSkills[${index}].skillId`);
      const minLevel = assertLevel(skill.minLevel, `requiredSkills[${index}].minLevel`);
      const priority = assertLevel(skill.priority, `requiredSkills[${index}].priority`);
      return { skillId, minLevel, priority };
    });
  }

  const projectIds =
    body.projects === undefined ? undefined : toObjectIdArray(body.projects, "projects");

  await assertExistAll(
    requiredSkills?.map((item) => item.skillId) ?? [],
    expertises,
    "expertises (skillId)",
  );
  await assertExistAll(projectIds ?? [], projects, "projects");

  return {
    positionName: positionName as string,
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
  const roles = await getRoleSet();

  if ("positionName" in body) {
    assertEnum(body.positionName, roles, "positionName");
    payload.positionName = body.positionName as string;
  }

  if ("thumbnailPic" in body && typeof body.thumbnailPic === "string") {
    payload.thumbnailPic = body.thumbnailPic.trim();
  }

  if ("subtitle" in body && typeof body.subtitle === "string") {
    payload.subtitle = body.subtitle.trim();
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
        const skill = entry as Record<string, unknown>;
        const skillId = toObjectId(skill.skillId, `requiredSkills[${index}].skillId`);
        const minLevel = assertLevel(skill.minLevel, `requiredSkills[${index}].minLevel`);
        const priority = assertLevel(skill.priority, `requiredSkills[${index}].priority`);
        return { skillId, minLevel, priority };
      });
      await assertExistAll(
        payload.requiredSkills.map((item) => item.skillId),
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
