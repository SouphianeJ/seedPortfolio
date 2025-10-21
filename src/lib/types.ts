import type { ObjectId } from "mongodb";

export type RoleKey = string;

export type SkillCategory =
  | "Gestion de projet"
  | "Ingénierie pédago"
  | "Web/API"
  | "Data/IA"
  | "Plateforme";

export interface ProjectDoc {
  _id: ObjectId;
  projectName: string;
  year: number;
  roles: RoleKey[];
  expertises?: ObjectId[];
  thumbnailPic?: string;
  shortDescription?: string;
}

export interface ExpertiseDoc {
  _id: ObjectId;
  expertiseName: string;
  level: 1 | 2 | 3 | 4 | 5;
  rolesPriority: RoleKey[];
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

export type CreateProjectPayload = Pick<
  ProjectDoc,
  "projectName" | "year" | "roles" | "expertises" | "thumbnailPic" | "shortDescription"
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

export type WithStringId<T> = Omit<T, "_id"> & { _id: string };
