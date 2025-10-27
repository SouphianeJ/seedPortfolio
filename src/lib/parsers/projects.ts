import { ObjectId } from "mongodb";
import {
  expertises,
  jobpositions,
  proofs as proofsCollection,
  tools as toolsCollection,
} from "@/lib/mongodb";
import type { CreateProjectPayload, UpdateProjectPayload } from "@/lib/types";
import { BadRequestError, toObjectIdArray } from "@/lib/parsers/objectid";
import { toObjectId } from "@/lib/ids";

const getRoleIdSet = async (): Promise<Set<string>> => {
  const collection = await jobpositions();
  const cursor = collection.find({}, { projection: { _id: 1 } });
  const roles = new Set<string>();
  for await (const document of cursor) {
    if (document?._id) {
      roles.add(document._id.toString());
    }
  }
  return roles;
};

const parseRoles = (
  value: unknown,
  roles: Set<string>,
  field: string,
  { required }: { required: boolean },
): ObjectId[] | undefined => {
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
  const parsed: ObjectId[] = [];

  value.forEach((entry, index) => {
    if (typeof entry !== "string" || !roles.has(entry)) {
      throw new BadRequestError(
        `L'identifiant de rôle ${entry as string} (${field}[${index}]) est inconnu. Les rôles doivent exister dans JobPositions.`,
      );
    }
    if (!seen.has(entry)) {
      seen.add(entry);
      parsed.push(toObjectId(entry));
    }
  });

  return parsed;
};

const assertExpertisesExist = async (
  ids: ObjectId[] | undefined,
  field: string,
) => {
  if (!ids?.length) {
    return;
  }

  const collection = await expertises();
  const count = await collection.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new BadRequestError(
      `Certaines expertises référencées dans ${field} n'existent pas en base.`,
    );
  }
};

const assertToolsExist = async (ids: ObjectId[] | undefined, field: string) => {
  if (!ids?.length) {
    return;
  }

  const collection = await toolsCollection();
  const count = await collection.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new BadRequestError(
      `Certains outils référencés dans ${field} n'existent pas en base.`,
    );
  }
};

const assertProofsExist = async (ids: ObjectId[] | undefined, field: string) => {
  if (!ids?.length) {
    return;
  }

  const collection = await proofsCollection();
  const count = await collection.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new BadRequestError(
      `Certaines preuves référencées dans ${field} n'existent pas en base.`,
    );
  }
};

const parseFireFacts = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new BadRequestError(`Le champ ${field} doit être un tableau.`);
  }

  const seen = new Set<string>();
  const parsed: string[] = [];

  value.forEach((entry, index) => {
    if (entry == null) {
      return;
    }
    if (typeof entry !== "string") {
      throw new BadRequestError(
        `Chaque élément de ${field} doit être une chaîne de caractères (index ${index}).`,
      );
    }
    const trimmed = entry.trim();
    if (!trimmed) {
      return;
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      parsed.push(trimmed);
    }
  });

  return parsed;
};

const parseYearField = (
  value: unknown,
  field: string,
  { required }: { required: boolean },
): number | number[] | undefined => {
  if (value == null || value === "") {
    if (required) {
      throw new BadRequestError(`Le champ ${field} est requis.`);
    }
    return undefined;
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new BadRequestError(
        `Le champ ${field} doit contenir des années entières (séparées par des points-virgules).`,
      );
    }
    return value;
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((entry) => {
        if (typeof entry === "number") {
          if (!Number.isInteger(entry)) {
            throw new BadRequestError(
              `Chaque valeur de ${field} doit être un entier séparé par un point-virgule.`,
            );
          }
          return entry.toString();
        }
        if (typeof entry === "string") {
          return entry;
        }
        throw new BadRequestError(
          `Chaque valeur de ${field} doit être un entier séparé par un point-virgule.`,
        );
      })
      .join(";");
    return parseYearField(joined, field, { required });
  }

  if (typeof value === "string") {
    const parts = value
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      if (required) {
        throw new BadRequestError(`Le champ ${field} est requis.`);
      }
      return undefined;
    }

    const years: number[] = [];
    const seen = new Set<number>();

    parts.forEach((part) => {
      const parsed = Number(part);
      if (!Number.isInteger(parsed)) {
        throw new BadRequestError(
          `Chaque valeur de ${field} doit être un entier séparé par un point-virgule.`,
        );
      }
      if (!seen.has(parsed)) {
        seen.add(parsed);
        years.push(parsed);
      }
    });

    if (years.length === 0) {
      if (required) {
        throw new BadRequestError(`Le champ ${field} est requis.`);
      }
      return undefined;
    }

    years.sort((a, b) => b - a);

    if (years.length === 1) {
      return years[0];
    }

    return years;
  }

  throw new BadRequestError(
    `Le champ ${field} doit être une chaîne ou un nombre entier (séparé par des points-virgules pour plusieurs entrées).`,
  );
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

  const year = parseYearField(body.year, "year", { required: true });
  if (year == null) {
    throw new BadRequestError("L'année est requise.");
  }

  const roles = await getRoleIdSet();
  const parsedRoles = parseRoles(body.roles, roles, "roles", { required: true }) ?? [];

  const thumbnailPic =
    typeof body.thumbnailPic === "string" && body.thumbnailPic.trim()
      ? body.thumbnailPic.trim()
      : undefined;
  const shortDescription =
    typeof body.shortDescription === "string" && body.shortDescription.trim()
      ? body.shortDescription.trim()
      : undefined;

  const expertiseIds =
    body.expertises != null
      ? toObjectIdArray(body.expertises, "expertises")
      : undefined;
  await assertExpertisesExist(expertiseIds, "expertises");

  const toolIds =
    body.tools != null ? toObjectIdArray(body.tools, "tools") : undefined;
  await assertToolsExist(toolIds, "tools");

  const proofIds =
    body.proofs != null ? toObjectIdArray(body.proofs, "proofs") : undefined;
  await assertProofsExist(proofIds, "proofs");

  let isKeyProjet = false;
  if ("isKeyProjet" in body) {
    if (typeof body.isKeyProjet === "boolean") {
      isKeyProjet = body.isKeyProjet;
    } else if (body.isKeyProjet != null) {
      throw new BadRequestError("Le champ isKeyProjet doit être un booléen.");
    }
  }

  return {
    projectName,
    year,
    roles: parsedRoles,
    expertises: expertiseIds,
    tools: toolIds,
    proofs: proofIds,
    thumbnailPic,
    shortDescription,
    isKeyProjet,
    fireFacts:
      body.fireFacts == null ? [] : parseFireFacts(body.fireFacts, "fireFacts"),
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
    const parsedYear = parseYearField(body.year, "year", { required: false });
    if (parsedYear === undefined) {
      payload.year = undefined;
    } else {
      payload.year = parsedYear;
    }
  }

  if ("roles" in body) {
    const roles = await getRoleIdSet();
    payload.roles = parseRoles(body.roles, roles, "roles", { required: false });
  }

  if ("thumbnailPic" in body && typeof body.thumbnailPic === "string") {
    payload.thumbnailPic = body.thumbnailPic.trim() || undefined;
  }

  if ("shortDescription" in body && typeof body.shortDescription === "string") {
    payload.shortDescription = body.shortDescription.trim() || undefined;
  }

  if ("expertises" in body) {
    if (body.expertises == null) {
      payload.expertises = undefined;
    } else {
      const expertiseIds = toObjectIdArray(body.expertises, "expertises");
      await assertExpertisesExist(expertiseIds, "expertises");
      payload.expertises = expertiseIds;
    }
  }

  if ("tools" in body) {
    if (body.tools == null) {
      payload.tools = [];
    } else {
      const toolIds = toObjectIdArray(body.tools, "tools");
      await assertToolsExist(toolIds, "tools");
      payload.tools = toolIds;
    }
  }

  if ("proofs" in body) {
    if (body.proofs == null) {
      payload.proofs = [];
    } else {
      const proofIds = toObjectIdArray(body.proofs, "proofs");
      await assertProofsExist(proofIds, "proofs");
      payload.proofs = proofIds;
    }
  }

  if ("isKeyProjet" in body) {
    if (typeof body.isKeyProjet === "boolean") {
      payload.isKeyProjet = body.isKeyProjet;
    } else if (body.isKeyProjet == null) {
      payload.isKeyProjet = false;
    } else {
      throw new BadRequestError("Le champ isKeyProjet doit être un booléen.");
    }
  }

  if ("fireFacts" in body) {
    if (body.fireFacts == null) {
      payload.fireFacts = [];
    } else {
      payload.fireFacts = parseFireFacts(body.fireFacts, "fireFacts");
    }
  }

  return payload;
};
