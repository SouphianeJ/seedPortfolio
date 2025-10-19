import type {
  ExpertiseDoc,
  JobPositionDoc,
  ProjectDoc,
} from "@/lib/types";

/** En base: ObjectId
 *  Dans les seeds: string pour _id et pour les refs (convertis dans les mappers).
 *  lastUsed reste string (format YYYY-MM-DD) conformément aux types + JSON Schema.
 */
export type SeedProject = Omit<ProjectDoc, "_id"> & { _id: string };
export type SeedExpertise = Omit<ExpertiseDoc, "_id"> & { _id: string };
export type SeedJobPosition = Omit<JobPositionDoc, "_id" | "requiredSkills" | "projects"> & {
  _id: string;
  positionName: string;
  requiredSkills?: {
    skillId: string;
    minLevel: 1 | 2 | 3 | 4 | 5;
    priority: 1 | 2 | 3 | 4 | 5;
  }[];
  projects?: string[];
};

/** -------- Projects -------- */
export const projectSeeds: SeedProject[] = [
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6d1",
    projectName: "Synergy Studio LMS",
    year: 2024,
    roles: ["Ingénierie pédagogique", "Administrateur Moodle", "Chef de projet"],
    thumbnailPic: "/thumbs/synergy-studio.png",
    shortDescription:
      "Refonte d'une plateforme Moodle avec une charte unifiée et des parcours adaptatifs.",
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6d2",
    projectName: "Campus Connect",
    year: 2023,
    roles: ["Administrateur Moodle", "Développeur web"],
    thumbnailPic: "/thumbs/campus-connect.png",
    shortDescription:
      "Industrialisation des déploiements Moodle et automatisation de l'onboarding des formateurs.",
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6d3",
    projectName: "Data Navigator",
    year: 2022,
    roles: ["Développeur web", "Chef de projet"],
    thumbnailPic: "/thumbs/data-navigator.png",
    shortDescription:
      "Catalogue de données pédagogiques avec tableaux de bord pour suivre la progression des apprenants.",
  },
];

/** -------- Expertises -------- */
export const expertiseSeeds: SeedExpertise[] = [
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6e1",
    expertiseName: "Design pédagogique avancé",
    level: 5,
    rolesPriority: ["Ingénierie pédagogique", "Chef de projet", "Administrateur Moodle"],
    category: "Ingénierie pédago",
    lastUsed: "2024-12-01",
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6e2",
    expertiseName: "Administration Moodle",
    level: 4,
    rolesPriority: ["Administrateur Moodle", "Ingénierie pédagogique", "Chef de projet"],
    category: "Plateforme",
    lastUsed: "2024-11-15",
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6e3",
    expertiseName: "Développement web full-stack",
    level: 5,
    rolesPriority: ["Développeur web", "Chef de projet", "Administrateur Moodle"],
    category: "Web/API",
    lastUsed: "2024-10-03",
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6e4",
    expertiseName: "Data storytelling",
    level: 3,
    rolesPriority: ["Développeur web", "Chef de projet"],
    category: "Data/IA",
    lastUsed: "2024-09-20",
  },
];

/** -------- JobPositions (source de vérité des rôles) -------- */
export const jobPositionSeeds: SeedJobPosition[] = [
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6f1",
    positionName: "Ingénierie pédagogique",
    subtitle: "Piloter la stratégie pédagogique et l'expérience apprenant",
    thumbnailPic: "/thumbs/learning-architect.png",
    requiredSkills: [
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e1", minLevel: 4, priority: 1 },
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e2", minLevel: 3, priority: 2 },
    ],
    projects: ["66f8a0c5e1a1d2f3a4b5c6d1"],
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6f2",
    positionName: "Administrateur Moodle",
    subtitle: "Garantir la disponibilité et l'optimisation de la plateforme",
    thumbnailPic: "/thumbs/platform-success.png",
    requiredSkills: [
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e2", minLevel: 4, priority: 1 },
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e3", minLevel: 4, priority: 2 },
    ],
    projects: ["66f8a0c5e1a1d2f3a4b5c6d2"],
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6f3",
    positionName: "Développeur web",
    subtitle: "Construire des fonctionnalités robustes et scalables",
    thumbnailPic: "/thumbs/dev-web.png",
    requiredSkills: [
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e3", minLevel: 4, priority: 1 },
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e4", minLevel: 2, priority: 3 },
    ],
    projects: ["66f8a0c5e1a1d2f3a4b5c6d3"],
  },
  {
    _id: "66f8a0c5e1a1d2f3a4b5c6f4",
    positionName: "Chef de projet",
    subtitle: "Coordonner, planifier et livrer à temps",
    thumbnailPic: "/thumbs/chef-projet.png",
    requiredSkills: [
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e1", minLevel: 3, priority: 2 },
      { skillId: "66f8a0c5e1a1d2f3a4b5c6e3", minLevel: 4, priority: 1 },
    ],
    projects: ["66f8a0c5e1a1d2f3a4b5c6d1", "66f8a0c5e1a1d2f3a4b5c6d3"],
  },
];
