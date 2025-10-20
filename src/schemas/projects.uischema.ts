import { UISchemaElement } from "@jsonforms/core";

const projectsUiSchema: UISchemaElement = {
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/projectName" },
    { type: "Control", scope: "#/properties/year" },
    { type: "Control", scope: "#/properties/roles" },
    { type: "Control", scope: "#/properties/thumbnailPic" },
    { type: "Control", scope: "#/properties/shortDescription", options: { multi: true } },
  ],
};

export default projectsUiSchema;
