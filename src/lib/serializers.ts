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
  "roles" | "expertises" | "tools"
> & {
  roles: string[];
  expertises?: string[];
  tools: string[];
  fireFacts: string[];
};

export const serializeProject = (project: ProjectDoc): SerializedProject => {
  const base = withStringId(project);
  return {
    ...base,
    roles: project.roles?.map((roleId) => roleId.toString()) ?? [],
    isKeyProjet: project.isKeyProjet ?? false,
    expertises: project.expertises?.map((expertiseId) => expertiseId.toString()),
    tools: project.tools?.map((toolId) => toolId.toString()) ?? [],
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
