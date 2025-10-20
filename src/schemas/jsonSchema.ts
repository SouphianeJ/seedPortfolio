import type { JsonSchema } from '@jsonforms/core';

export const personSchema: JsonSchema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 2,
      description: 'First name',
    },
    lastName: {
      type: 'string',
      minLength: 2,
      description: 'Last name',
    },
    birthday: {
      type: 'string',
      format: 'date',
    },
    nationality: {
      type: 'string',
      enum: ['DE', 'US', 'IT', 'FR', 'UK', 'ES', 'JP'],
    },
    occupation: {
      type: 'string',
      maxLength: 40,
    },
    personalData: {
      type: 'object',
      properties: {
        age: {
          type: 'integer',
          minimum: 18,
        },
        height: {
          type: 'number',
        },
        vegetarian: {
          type: 'boolean',
        },
      },
      required: ['age'],
    },
    postalCode: {
      type: 'string',
      pattern: '[0-9]{5}',
    },
  },
  required: ['firstName', 'lastName', 'personalData'],
};
