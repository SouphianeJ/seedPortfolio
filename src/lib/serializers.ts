import type { ObjectId } from "mongodb";
import type {
  ExpertiseDoc,
  JobPositionDoc,
  ProjectDoc,
  SerializedExpertise,
  SerializedJobPosition,
  SerializedProject,
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

export const serializeProject = (project: ProjectDoc): SerializedProject => {
  const base = withStringId(project);
  return {
    ...base,
    roles: project.roles?.map((roleId) => roleId.toString()) ?? [],
  };
};

export const serializeExpertise = (
  expertise: ExpertiseDoc,
): SerializedExpertise => {
  const base = withStringId(expertise);
  return {
    ...base,
    rolesPriority: expertise.rolesPriority?.map((roleId) => roleId.toString()) ?? [],
  };
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
