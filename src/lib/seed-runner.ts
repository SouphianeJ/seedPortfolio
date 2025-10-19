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

/** ----------------- Helpers ----------------- */
const is24Hex = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);
const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const toObjectId = (id: string | ObjectId): ObjectId => {
  if (id instanceof ObjectId) return id;
  if (!is24Hex(id)) throw new Error(`Invalid ObjectId string: "${id}"`);
  return new ObjectId(id);
};

const stripUndefined = <T extends Record<string, any>>(obj: T): T => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      out[k] = v.map((item) => {
        if (item === undefined) return item;
        if (item && typeof item === "object" && !(item instanceof ObjectId)) {
          return stripUndefined(item as Record<string, any>);
        }
        return item;
      });
    } else if (v && typeof v === "object" && !(v instanceof ObjectId)) {
      out[k] = stripUndefined(v as Record<string, any>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
};

/** ----------------- Mapping seeds -> docs prêts DB ----------------- */
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

/** ----------------- Validation d’intégrité ----------------- */
const validateSeedIntegrity = ({
  projects,
  expertises,
  jobs,
}: {
  projects: SeedProject[];
  expertises: SeedExpertise[];
  jobs: SeedJobPosition[];
}) => {
  const errors: string[] = [];

  const ROLE_SET = new Set(jobs.map((j) => j.positionName));
  if (ROLE_SET.size === 0) {
    errors.push("Aucun role key (positionName) trouvé dans jobPositionSeeds.");
  }

  for (const s of [...projects, ...expertises, ...jobs]) {
    if (!is24Hex(s._id)) errors.push(`ID invalide: ${s._id}`);
  }

  for (const e of expertises) {
    if (!(e.level >= 1 && e.level <= 5)) {
      errors.push(`Expertise ${e._id} level hors limites: ${e.level}`);
    }
    if (e.lastUsed && !isIsoDate(e.lastUsed)) {
      errors.push(`Expertise ${e._id} lastUsed non ISO (YYYY-MM-DD): ${e.lastUsed}`);
    }
    for (const r of e.rolesPriority) {
      if (!ROLE_SET.has(r)) {
        errors.push(
          `Expertise ${e._id} rolesPriority contient un rôle inconnu: "${r}". Les rôles autorisés proviennent de JobPositions.positionName.`,
        );
      }
    }
  }

  for (const p of projects) {
    for (const r of p.roles) {
      if (!ROLE_SET.has(r)) {
        errors.push(
          `Project ${p._id} roles contient un rôle inconnu: "${r}". Les rôles autorisés proviennent de JobPositions.positionName.`,
        );
      }
    }
  }

  const projectIds = new Set(projects.map((p) => p._id));
  const expertiseIds = new Set(expertises.map((e) => e._id));

  for (const j of jobs) {
    if (!ROLE_SET.has(j.positionName)) {
      errors.push(`Job ${j._id} positionName "${j.positionName}" absent de ROLE_SET (incohérence interne).`);
    }

    j.requiredSkills?.forEach((rs, idx) => {
      if (!is24Hex(rs.skillId)) {
        errors.push(`Job ${j._id} requiredSkills[${idx}] skillId non-hex: ${rs.skillId}`);
      } else if (!expertiseIds.has(rs.skillId)) {
        errors.push(`Job ${j._id} requiredSkills[${idx}] skillId inconnu: ${rs.skillId}`);
      }
      if (!(rs.minLevel >= 1 && rs.minLevel <= 5)) {
        errors.push(`Job ${j._id} requiredSkills[${idx}] minLevel hors limites: ${rs.minLevel}`);
      }
      if (!(rs.priority >= 1 && rs.priority <= 5)) {
        errors.push(`Job ${j._id} requiredSkills[${idx}] priority hors limites: ${rs.priority}`);
      }
    });

    j.projects?.forEach((pid, idx) => {
      if (!is24Hex(pid)) {
        errors.push(`Job ${j._id} projects[${idx}] non-hex: ${pid}`);
      } else if (!projectIds.has(pid)) {
        errors.push(`Job ${j._id} project inconnu: ${pid}`);
      }
    });
  }

  if (errors.length) {
    const msg = errors.map((e) => ` - ${e}`).join("\n");
    throw new Error(`Seed integrity failed:\n${msg}`);
  }
};

/** ----------------- Résumé Mongo ----------------- */
const summarize = (result: BulkWriteResult) => ({
  matched: result.matchedCount,
  modified: result.modifiedCount,
  upserted: result.upsertedCount,
});

/** ----------------- API principale ----------------- */
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

    const projDocs = projectSeeds.map(mapProjectSeed);
    const expDocs = expertiseSeeds.map(mapExpertiseSeed);
    const jobDocs = jobPositionSeeds.map(mapJobSeed);

    const [pRes, eRes, jRes] = await Promise.all([
      projectCollection.insertMany(projDocs, { ordered: false }),
      expertiseCollection.insertMany(expDocs, { ordered: false }),
      jobCollection.insertMany(jobDocs, { ordered: false }),
    ]);

    return {
      mode,
      projects: { inserted: pRes.insertedCount },
      expertises: { inserted: eRes.insertedCount },
      jobpositions: { inserted: jRes.insertedCount },
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
