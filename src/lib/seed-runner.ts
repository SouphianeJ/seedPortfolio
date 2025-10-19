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

const is24Hex = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);
const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const toObjectId = (id: string | ObjectId): ObjectId => {
  if (id instanceof ObjectId) return id;
  if (!is24Hex(id)) throw new Error(`Invalid ObjectId string: "${id}"`);
  return new ObjectId(id);
};

const stripUndefined = <T extends Record<string, unknown>>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.map((entry) =>
        entry && typeof entry === "object" && !(entry instanceof ObjectId)
          ? stripUndefined(entry as Record<string, unknown>)
          : entry,
      );
      continue;
    }
    if (value && typeof value === "object" && !(value instanceof ObjectId)) {
      result[key] = stripUndefined(value as Record<string, unknown>);
      continue;
    }
    result[key] = value;
  }
  return result as T;
};

const mapProjectSeed = (seed: SeedProject) =>
  stripUndefined({
    ...seed,
    _id: toObjectId(seed._id),
  });

const mapExpertiseSeed = (seed: SeedExpertise) =>
  stripUndefined({
    ...seed,
    _id: toObjectId(seed._id),
    lastUsed: seed.lastUsed,
  });

const mapJobSeed = (seed: SeedJobPosition) =>
  stripUndefined({
    ...seed,
    _id: toObjectId(seed._id),
    requiredSkills: seed.requiredSkills?.map((skill) => ({
      ...skill,
      skillId: toObjectId(skill.skillId),
    })),
    projects: seed.projects?.map(toObjectId),
  });

type SeedCollections = {
  projects: SeedProject[];
  expertises: SeedExpertise[];
  jobs: SeedJobPosition[];
};

const validateSeedIntegrity = ({ projects, expertises, jobs }: SeedCollections) => {
  const errors: string[] = [];

  const ROLE_SET = new Set(jobs.map((job) => job.positionName));
  if (ROLE_SET.size === 0) {
    errors.push("Aucun role key (positionName) trouvé dans jobPositionSeeds.");
  }

  for (const seed of [...projects, ...expertises, ...jobs]) {
    if (!is24Hex(seed._id)) errors.push(`ID invalide: ${seed._id}`);
  }

  for (const expertise of expertises) {
    if (!(expertise.level >= 1 && expertise.level <= 5)) {
      errors.push(`Expertise ${expertise._id} level hors limites: ${expertise.level}`);
    }
    if (expertise.lastUsed && !isIsoDate(expertise.lastUsed)) {
      errors.push(`Expertise ${expertise._id} lastUsed non ISO (YYYY-MM-DD): ${expertise.lastUsed}`);
    }
    for (const role of expertise.rolesPriority) {
      if (!ROLE_SET.has(role)) {
        errors.push(
          `Expertise ${expertise._id} rolesPriority contient un rôle inconnu: "${role}". Les rôles autorisés proviennent de JobPositions.positionName.`,
        );
      }
    }
  }

  for (const project of projects) {
    for (const role of project.roles) {
      if (!ROLE_SET.has(role)) {
        errors.push(
          `Project ${project._id} roles contient un rôle inconnu: "${role}". Les rôles autorisés proviennent de JobPositions.positionName.`,
        );
      }
    }
  }

  const projectIds = new Set(projects.map((project) => project._id));
  const expertiseIds = new Set(expertises.map((expertise) => expertise._id));

  for (const job of jobs) {
    if (!ROLE_SET.has(job.positionName)) {
      errors.push(`Job ${job._id} positionName "${job.positionName}" absent de ROLE_SET (incohérence interne).`);
    }

    job.requiredSkills?.forEach((skill, index) => {
      if (!is24Hex(skill.skillId)) {
        errors.push(`Job ${job._id} requiredSkills[${index}] skillId non-hex: ${skill.skillId}`);
      } else if (!expertiseIds.has(skill.skillId)) {
        errors.push(`Job ${job._id} requiredSkills[${index}] skillId inconnu: ${skill.skillId}`);
      }
      if (!(skill.minLevel >= 1 && skill.minLevel <= 5)) {
        errors.push(`Job ${job._id} requiredSkills[${index}] minLevel hors limites: ${skill.minLevel}`);
      }
      if (!(skill.priority >= 1 && skill.priority <= 5)) {
        errors.push(`Job ${job._id} requiredSkills[${index}] priority hors limites: ${skill.priority}`);
      }
    });

    job.projects?.forEach((projectId, index) => {
      if (!is24Hex(projectId)) {
        errors.push(`Job ${job._id} projects[${index}] non-hex: ${projectId}`);
      } else if (!projectIds.has(projectId)) {
        errors.push(`Job ${job._id} project inconnu: ${projectId}`);
      }
    });
  }

  if (errors.length > 0) {
    const message = errors.map((error) => ` - ${error}`).join("\n");
    throw new Error(`Seed integrity failed:\n${message}`);
  }
};

const summarize = (result: BulkWriteResult) => ({
  matched: result.matchedCount,
  modified: result.modifiedCount,
  upserted: result.upsertedCount,
});

type SeedMode = "reset" | "upsert";

export const runSeed = async (opts: { mode?: SeedMode } = {}) => {
  const mode: SeedMode = opts.mode ?? "upsert";

  validateSeedIntegrity({
    projects: projectSeeds,
    expertises: expertiseSeeds,
    jobs: jobPositionSeeds,
  });

  const [projectCollection, expertiseCollection, jobCollection] = await Promise.all([
    projects(),
    expertises(),
    jobpositions(),
  ]);

  if (mode === "reset") {
    await Promise.all([
      jobCollection.deleteMany({}),
      expertiseCollection.deleteMany({}),
      projectCollection.deleteMany({}),
    ]);

    const projectDocs = projectSeeds.map(mapProjectSeed);
    const expertiseDocs = expertiseSeeds.map(mapExpertiseSeed);
    const jobDocs = jobPositionSeeds.map(mapJobSeed);

    const [projectInsert, expertiseInsert, jobInsert] = await Promise.all([
      projectCollection.insertMany(projectDocs, { ordered: false }),
      expertiseCollection.insertMany(expertiseDocs, { ordered: false }),
      jobCollection.insertMany(jobDocs, { ordered: false }),
    ]);

    return {
      mode,
      projects: { inserted: projectInsert.insertedCount },
      expertises: { inserted: expertiseInsert.insertedCount },
      jobpositions: { inserted: jobInsert.insertedCount },
    };
  }

  const [projectResult, expertiseResult, jobResult] = await Promise.all([
    projectCollection.bulkWrite(
      projectSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapProjectSeed(seed),
          upsert: true,
        },
      })),
      { ordered: false },
    ),
    expertiseCollection.bulkWrite(
      expertiseSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapExpertiseSeed(seed),
          upsert: true,
        },
      })),
      { ordered: false },
    ),
    jobCollection.bulkWrite(
      jobPositionSeeds.map((seed) => ({
        replaceOne: {
          filter: { _id: toObjectId(seed._id) },
          replacement: mapJobSeed(seed),
          upsert: true,
        },
      })),
      { ordered: false },
    ),
  ]);

  return {
    mode,
    projects: summarize(projectResult),
    expertises: summarize(expertiseResult),
    jobpositions: summarize(jobResult),
  };
};
