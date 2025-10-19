import { ObjectId } from "mongodb";

export class BadRequestError extends Error {}

const HEX24 = /^[0-9a-fA-F]{24}$/;

export const toObjectId = (value: unknown, field: string): ObjectId => {
  if (typeof value !== "string" || !HEX24.test(value)) {
    throw new BadRequestError(`Le champ ${field} doit être un ObjectId valide (24-hex).`);
  }
  return new ObjectId(value);
};

export const toOptionalObjectId = (
  value: unknown,
  field: string,
): ObjectId | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  return toObjectId(value, field);
};

export const toObjectIdArray = (value: unknown, field: string): ObjectId[] => {
  if (!Array.isArray(value)) {
    throw new BadRequestError(`Le champ ${field} doit être un tableau d'ObjectId.`);
  }
  return value.map((entry, index) => toObjectId(entry, `${field}[${index}]`));
};
