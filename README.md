# JSON Forms React Seed

This project bootstraps a JSON Forms demo using Vite, React, and Material UI renderers. It mirrors the official Eclipse JSON Forms React seed setup while keeping the configuration minimal for experimentation.

## Available Scripts

- `npm run dev` – start the Vite development server on port 3000.
- `npm run build` – type-check the project and generate a production bundle.
- `npm run start` – preview the production build locally.
- `npm run lint` – lint the codebase with ESLint.
- `npm run test` – execute Vitest with coverage reporting.
- `npm run format` – format supported files with Prettier.

## Project Structure

```
├── public/              # Static assets copied as-is to the final build
├── src/
│   ├── App.tsx          # JSON Forms demo with Material renderers
│   ├── index.css        # Global styles
│   ├── main.tsx         # Application entry point
│   └── schemas/         # JSON schema and UI schema definitions
├── eslint.config.mjs    # ESLint configuration for TypeScript/React
├── tsconfig*.json       # TypeScript configuration files
└── vite.config.ts       # Vite configuration
```

## JSON Forms Demo

The demo showcases a basic person form driven entirely by JSON schema definitions. It demonstrates how to:

- Configure JSON Forms with Material renderers
- Provide a data object, JSON schema, and UI schema
- React to data and validation changes to show live form state

Feel free to adjust the schemas or provide your own renderers to adapt the demo for your use case.

## Learn More

- [JSON Forms documentation](https://jsonforms.io/)
- [Material UI](https://mui.com/)
- [Vite](https://vitejs.dev/)

