export type ResourceKey = "projects" | "expertises" | "jobs";

export type ProjectRecord = {
  id: string;
  projectName: string;
  year?: number;
  roles?: string[];
  thumbnailPic?: string;
  shortDescription?: string;
};

export type ExpertiseRecord = {
  id: string;
  expertiseName: string;
  level?: number;
  rolesPriority?: string[];
  category?: string;
  lastUsed?: string;
};

export type JobRecord = {
  id: string;
  positionName: string;
  subtitle?: string;
  thumbnailPic?: string;
  requiredSkills?: {
    skillId: string;
    minLevel: number;
    priority: number;
  }[];
  projects?: string[];
};

export type ResourceRecord = ProjectRecord | ExpertiseRecord | JobRecord;
