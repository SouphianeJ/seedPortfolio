import type { ObjectId } from "mongodb";

export type SkillCategory =
  | "Gestion de projet"
  | "Ingénierie pédago"
  | "Web/API"
  | "Data/IA"
  | "Plateforme";

export interface ProjectDoc {
  _id: ObjectId;
  projectName: string;
  year: number | number[];
  roles: ObjectId[];
  expertises?: ObjectId[];
  tools?: ObjectId[];
  thumbnailPic?: string;
  shortDescription?: string;
  isKeyProjet?: boolean;
  fireFacts?: string[];
}

export interface ExpertiseDoc {
  _id: ObjectId;
  expertiseName: string;
  level: 1 | 2 | 3 | 4 | 5;
  rolesPriority: string[];
  description?: string;
  category?: SkillCategory;
  lastUsed?: string;
}

export interface JobPositionDoc {
  _id: ObjectId;
  positionName: string;
  requiredSkills?: {
    skillId: ObjectId;
    minLevel: 1 | 2 | 3 | 4 | 5;
    priority: 1 | 2 | 3 | 4 | 5;
  }[];
  projects?: ObjectId[];
  thumbnailPic?: string;
  subtitle?: string;
}

export interface ToolDoc {
  _id: ObjectId;
  toolName: string;
  level: 1 | 2 | 3 | 4 | 5;
  description?: string;
  usage?: string;
}

export type ProofType = "image" | "video" | "texte" | "file";

export interface ProofDoc {
  _id: ObjectId;
  proofName: string;
  description?: string;
  link: string;
  type: ProofType;
}

export type CreateProjectPayload = Pick<
  ProjectDoc,
  | "projectName"
  | "year"
  | "roles"
  | "expertises"
  | "tools"
  | "thumbnailPic"
  | "shortDescription"
  | "isKeyProjet"
  | "fireFacts"
>;

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export type CreateExpertisePayload = Pick<
  ExpertiseDoc,
  "expertiseName" | "level" | "rolesPriority" | "description" | "category" | "lastUsed"
>;

export type UpdateExpertisePayload = Partial<CreateExpertisePayload>;

export type CreateJobPositionPayload = Pick<
  JobPositionDoc,
  "positionName" | "requiredSkills" | "projects" | "thumbnailPic" | "subtitle"
>;

export type UpdateJobPositionPayload = Partial<CreateJobPositionPayload>;

export type CreateToolPayload = Pick<
  ToolDoc,
  "toolName" | "level" | "description" | "usage"
>;

export type UpdateToolPayload = Partial<CreateToolPayload>;

export type CreateProofPayload = Pick<
  ProofDoc,
  "proofName" | "description" | "link" | "type"
>;

export type UpdateProofPayload = Partial<CreateProofPayload>;

export type WithStringId<T> = Omit<T, "_id"> & { _id: string };
