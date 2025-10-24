import type {
  CreateProofPayload,
  ProofType,
  UpdateProofPayload,
} from "@/lib/types";
import { BadRequestError } from "@/lib/parsers/objectid";

const allowedTypes: ProofType[] = ["image", "video", "texte"];

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

const getOptionalString = (value: unknown, field: string): string | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const getRequiredUrl = (value: unknown, field: string): string => {
  const url = getOptionalUrl(value, field);
  if (!url) {
    throw new BadRequestError(`Le champ ${field} est requis.`);
  }
  return url;
};

const getOptionalUrl = (value: unknown, field: string): string | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} doit être une chaîne.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol.startsWith("http")) {
      throw new BadRequestError(
        `Le champ ${field} doit être une URL valide commençant par http ou https.`,
      );
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError(`Le champ ${field} doit être une URL valide.`);
  }
  return trimmed;
};

const parseType = (value: unknown, field: string): ProofType => {
  if (typeof value !== "string") {
    throw new BadRequestError(`Le champ ${field} est requis.`);
  }
  const trimmed = value.trim();
  if (!allowedTypes.includes(trimmed as ProofType)) {
    throw new BadRequestError(
      `Le champ ${field} doit être l'une des valeurs suivantes : ${allowedTypes.join(", ")}.`,
    );
  }
  return trimmed as ProofType;
};

export const parseProofCreate = (
  body: Record<string, unknown>,
): CreateProofPayload => {
  const proofName = getRequiredString(body.proofName, "proofName");
  const description = getOptionalString(body.description, "description");
  const link = getRequiredUrl(body.link, "link");
  const type = parseType(body.type, "type");

  const payload: CreateProofPayload = {
    proofName,
    link,
    type,
  };

  if (description) {
    payload.description = description;
  }

  return payload;
};

export const parseProofUpdate = (
  body: Record<string, unknown>,
): UpdateProofPayload => {
  const payload: UpdateProofPayload = {};

  if ("proofName" in body) {
    payload.proofName = getRequiredString(body.proofName, "proofName");
  }

  if ("description" in body) {
    payload.description = getOptionalString(body.description, "description");
  }

  if ("link" in body) {
    payload.link = getRequiredUrl(body.link, "link");
  }

  if ("type" in body) {
    payload.type = parseType(body.type, "type");
  }

  return payload;
};
