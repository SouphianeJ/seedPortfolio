import { UISchemaElement } from "@jsonforms/core";

const jobpositionsUiSchema: UISchemaElement = {
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/positionName" },
    { type: "Control", scope: "#/properties/subtitle" },
    { type: "Control", scope: "#/properties/thumbnailPic" },
    {
      type: "Group",
      label: "Associations",
      elements: [
        {
          type: "Control",
          scope: "#/properties/requiredSkills",
          options: {
            detail: {
              type: "VerticalLayout",
              elements: [
                { type: "Control", scope: "#/properties/skillId" },
                { type: "Control", scope: "#/properties/minLevel" },
                { type: "Control", scope: "#/properties/priority" },
              ],
            },
          },
        },
        { type: "Control", scope: "#/properties/projects" },
      ],
    },
  ],
};

export default jobpositionsUiSchema;
