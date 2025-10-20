import { JsonSchema } from "@jsonforms/core";

const jobpositionsSchema: JsonSchema = {
  $id: "JobPositionsSchema",
  type: "object",
  properties: {
    positionName: { type: "string", title: "Intitulé du poste" },
    subtitle: { type: "string", title: "Sous-titre" },
    thumbnailPic: { type: "string", title: "Vignette (URL)" },
    requiredSkills: {
      type: "array",
      title: "Compétences requises",
      items: {
        type: "object",
        properties: {
          skillId: { type: "string", title: "Compétence" },
          minLevel: {
            type: "integer",
            title: "Niveau minimum",
            minimum: 1,
            maximum: 5,
            default: 3,
          },
          priority: {
            type: "integer",
            title: "Priorité",
            minimum: 1,
            maximum: 5,
            default: 3,
          },
        },
        required: ["skillId", "minLevel", "priority"],
        additionalProperties: false,
      },
      default: [],
    },
    projects: {
      type: "array",
      title: "Projets associés",
      items: { type: "string", title: "Projet" },
      uniqueItems: true,
      default: [],
    },
  },
  required: ["positionName"],
  additionalProperties: false,
};

export default jobpositionsSchema;
