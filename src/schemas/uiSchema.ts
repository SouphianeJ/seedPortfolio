import type { UISchemaElement } from '@jsonforms/core';

export const personUiSchema: UISchemaElement = {
  type: 'VerticalLayout',
  elements: [
    {
      type: 'HorizontalLayout',
      elements: [
        { type: 'Control', scope: '#/properties/firstName' },
        { type: 'Control', scope: '#/properties/lastName' },
      ],
    },
    {
      type: 'Group',
      label: 'Personal Data',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            { type: 'Control', scope: '#/properties/personalData/properties/age' },
            {
              type: 'Control',
              scope: '#/properties/personalData/properties/height',
            },
          ],
        },
        {
          type: 'Control',
          scope: '#/properties/personalData/properties/vegetarian',
        },
      ],
    },
    { type: 'Control', scope: '#/properties/birthday' },
    { type: 'Control', scope: '#/properties/nationality' },
    { type: 'Control', scope: '#/properties/occupation' },
    { type: 'Control', scope: '#/properties/postalCode' },
  ],
};
