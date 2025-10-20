import { JsonSchema } from "@jsonforms/core";

const expertisesSchema: JsonSchema = {
  $id: "ExpertisesSchema",
  type: "object",
  properties: {
    expertiseName: { type: "string", title: "Nom de l'expertise" },
    level: { type: "integer", title: "Niveau", minimum: 1, maximum: 5, default: 3 },
    rolesPriority: {
      type: "array",
      title: "Rôles prioritaires",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
    category: { type: "string", title: "Catégorie" },
    lastUsed: { type: "string", format: "date", title: "Dernière utilisation" },
  },
  required: ["expertiseName"],
  additionalProperties: false,
};

export default expertisesSchema;
