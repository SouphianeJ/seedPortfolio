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
  year: number;
  roles: ObjectId[];
  thumbnailPic?: string;
  shortDescription?: string;
}

export interface ExpertiseDoc {
  _id: ObjectId;
  expertiseName: string;
  level: 1 | 2 | 3 | 4 | 5;
  rolesPriority: ObjectId[];
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

export interface CreateProjectPayload {
  projectName: string;
  year: number;
  roles: string[];
  thumbnailPic?: string;
  shortDescription?: string;
}

export interface UpdateProjectPayload {
  projectName?: string;
  year?: number;
  roles?: string[];
  thumbnailPic?: string;
  shortDescription?: string;
}

export interface CreateExpertisePayload {
  expertiseName: string;
  level: 1 | 2 | 3 | 4 | 5;
  rolesPriority: string[];
  category?: SkillCategory;
  lastUsed?: string;
}

export interface UpdateExpertisePayload {
  expertiseName?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  rolesPriority?: string[];
  category?: SkillCategory;
  lastUsed?: string;
}

export interface CreateJobPositionPayload {
  positionName: string;
  requiredSkills?: {
    skillId: string;
    minLevel: 1 | 2 | 3 | 4 | 5;
    priority: 1 | 2 | 3 | 4 | 5;
  }[];
  projects?: string[];
  thumbnailPic?: string;
  subtitle?: string;
}

export interface UpdateJobPositionPayload {
  positionName?: string;
  requiredSkills?: {
    skillId: string;
    minLevel: 1 | 2 | 3 | 4 | 5;
    priority: 1 | 2 | 3 | 4 | 5;
  }[];
  projects?: string[];
  thumbnailPic?: string;
  subtitle?: string;
}

export type WithStringId<T> = Omit<T, "_id"> & { _id: string };

export type SerializedProject = Omit<WithStringId<ProjectDoc>, "roles"> & {
  roles: string[];
};

export type SerializedExpertise = Omit<WithStringId<ExpertiseDoc>, "rolesPriority"> & {
  rolesPriority: string[];
};

export type SerializedJobPosition = Omit<
  WithStringId<JobPositionDoc>,
  "requiredSkills" | "projects"
> & {
  requiredSkills?: {
    skillId: string;
    minLevel: 1 | 2 | 3 | 4 | 5;
    priority: 1 | 2 | 3 | 4 | 5;
  }[];
  projects?: string[];
};
