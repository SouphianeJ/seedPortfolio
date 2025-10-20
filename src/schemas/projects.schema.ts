import { JsonSchema } from "@jsonforms/core";

const projectsSchema: JsonSchema = {
  $id: "ProjectsSchema",
  type: "object",
  properties: {
    projectName: { type: "string", title: "Nom du projet" },
    year: { type: "integer", title: "Année", minimum: 2000, maximum: 2100 },
    roles: {
      type: "array",
      title: "Rôles",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
    thumbnailPic: { type: "string", title: "Vignette (URL)" },
    shortDescription: { type: "string", title: "Résumé" },
  },
  required: ["projectName", "year"],
  additionalProperties: false,
};

export default projectsSchema;
