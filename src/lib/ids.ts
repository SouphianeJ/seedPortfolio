import { ObjectId } from "mongodb";

export const isValidObjectId = (value: string): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  if (!ObjectId.isValid(value)) {
    return false;
  }
  try {
    return new ObjectId(value).toString() === value;
  } catch {
    return false;
  }
};

export const toObjectId = (value: string): ObjectId => {
  if (!isValidObjectId(value)) {
    throw new Error("Identifiant invalide");
  }
  return new ObjectId(value);
};

export const createObjectId = (): ObjectId => new ObjectId();
