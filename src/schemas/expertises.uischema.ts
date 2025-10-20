import { UISchemaElement } from "@jsonforms/core";

const expertisesUiSchema: UISchemaElement = {
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/expertiseName" },
    {
      type: "Group",
      label: "Profil",
      elements: [
        { type: "Control", scope: "#/properties/level" },
        { type: "Control", scope: "#/properties/category" },
      ],
    },
    { type: "Control", scope: "#/properties/rolesPriority" },
    { type: "Control", scope: "#/properties/lastUsed" },
  ],
};

export default expertisesUiSchema;
