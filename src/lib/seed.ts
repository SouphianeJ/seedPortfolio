import { ObjectId, type BulkWriteResult } from "mongodb";
import { expertises, jobpositions, projects } from "@/lib/mongodb";
import {
  expertiseSeeds,
  jobPositionSeeds,
  projectSeeds,
  type SeedExpertise,
  type SeedJobPosition,
  type SeedProject,
} from "@/lib/seed-data";

const toObjectId = (id: string): ObjectId => new ObjectId(id);

const mapProjectSeed = (seed: SeedProject) => ({
  ...seed,
  _id: toObjectId(seed._id),
});

const mapExpertiseSeed = (seed: SeedExpertise) => ({
  ...seed,
  _id: toObjectId(seed._id),
});

const mapJobSeed = (seed: SeedJobPosition) => ({
  ...seed,
  _id: toObjectId(seed._id),
  requiredSkills: seed.requiredSkills?.map((skill) => ({
    ...skill,
    skillId: toObjectId(skill.skillId),
  })),
  projects: seed.projects?.map(toObjectId),
});

const summarize = (result: BulkWriteResult) => ({
  matched: result.matchedCount,
  modified: result.modifiedCount,
  upserted: result.upsertedCount,
});

export const runSeed = async () => {
  const [projectCollection, expertiseCollection, jobCollection] = await Promise.all([
    projects(),
    expertises(),
    jobpositions(),
  ]);

  const [projectResult, expertiseResult, jobResult] = await Promise.all([
    projectCollection.bulkWrite(
      projectSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapProjectSeed(seed),
          upsert: true,
        },
      })),
    ),
    expertiseCollection.bulkWrite(
      expertiseSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapExpertiseSeed(seed),
          upsert: true,
        },
      })),
    ),
    jobCollection.bulkWrite(
      jobPositionSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapJobSeed(seed),
          upsert: true,
        },
      })),
    ),
  ]);

  return {
    projects: summarize(projectResult),
    expertises: summarize(expertiseResult),
    jobpositions: summarize(jobResult),
  };
};
