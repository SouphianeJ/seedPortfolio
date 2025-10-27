import type { ObjectId } from "mongodb";
import type {
  ExpertiseDoc,
  JobPositionDoc,
  ProjectDoc,
  ProofDoc,
  ToolDoc,
  WithStringId,
} from "@/lib/types";

const withStringId = <T extends { _id: ObjectId }>(
  doc: T,
): WithStringId<T> => {
  const { _id, ...rest } = doc;
  return {
    ...(rest as Omit<T, "_id">),
    _id: _id.toString(),
  };
};

export type SerializedProject = Omit<
  WithStringId<ProjectDoc>,
  "roles" | "expertises" | "tools" | "proofs" | "year"
> & {
  roles: string[];
  expertises?: string[];
  tools: string[];
  proofs: string[];
  fireFacts: string[];
  year: string;
};

export const serializeProject = (project: ProjectDoc): SerializedProject => {
  const {
    year: _ignoredYear,
    roles: _ignoredRoles,
    expertises: _ignoredExpertises,
    tools: _ignoredTools,
    proofs: _ignoredProofs,
    ...rest
  } = withStringId(project);
  void _ignoredYear;
  void _ignoredRoles;
  void _ignoredExpertises;
  void _ignoredTools;
  void _ignoredProofs;
  const formatYear = (value: unknown): string => {
    if (Array.isArray(value)) {
      const numbers = value
        .map((entry) => {
          if (typeof entry === "number") {
            return entry;
          }
          if (typeof entry === "string") {
            const parsed = Number(entry.trim());
            return Number.isInteger(parsed) ? parsed : undefined;
          }
          return undefined;
        })
        .filter((entry): entry is number => entry != null);

      if (numbers.length === 0) {
        return "";
      }

      const unique = Array.from(new Set(numbers)).sort((a, b) => b - a);
      return unique.map((entry) => entry.toString()).join(" ; ");
    }
    if (typeof value === "number") {
      return value.toString();
    }
    if (typeof value === "string") {
      const parts = value
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        return "";
      }
      const unique = Array.from(new Set(parts));
      return unique.join(" ; ");
    }
    return "";
  };
  return {
    ...rest,
    year: formatYear(project.year),
    roles: project.roles?.map((roleId) => roleId.toString()) ?? [],
    isKeyProjet: project.isKeyProjet ?? false,
    expertises: project.expertises?.map((expertiseId) => expertiseId.toString()),
    tools: project.tools?.map((toolId) => toolId.toString()) ?? [],
    proofs: project.proofs?.map((proofId) => proofId.toString()) ?? [],
    fireFacts: project.fireFacts ?? [],
  };
};

export const serializeExpertise = (
  expertise: ExpertiseDoc,
): WithStringId<ExpertiseDoc> => withStringId(expertise);

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

export const serializeJobPosition = (job: JobPositionDoc): SerializedJobPosition => {
  const base = withStringId(job);
  return {
    ...base,
    requiredSkills: job.requiredSkills?.map(({ skillId, ...rest }) => ({
      ...rest,
      skillId: skillId.toString(),
    })),
    projects: job.projects?.map((projectId) => projectId.toString()),
  };
};

export const serializeTool = (tool: ToolDoc): WithStringId<ToolDoc> =>
  withStringId(tool);

export type SerializedProof = WithStringId<ProofDoc>;

export const serializeProof = (proof: ProofDoc): SerializedProof =>
  withStringId(proof);
