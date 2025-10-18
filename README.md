# Seed Portfolio Admin

Interface d'administration Next.js 14 (App Router) pour gérer trois collections MongoDB : projets, expertises et postes. Les formulaires sont entièrement générés avec [JSON Forms](https://jsonforms.io/) et les listes consomment l'API via [SWR](https://swr.vercel.app/).

## Prérequis
- Node.js 18+
- Accès à une base MongoDB (Atlas ou auto-hébergée)

## Installation
```bash
npm install
```

Créez un fichier `.env.local` à partir de l'exemple fourni :

```bash
cp .env.local.example .env.local
```

Renseignez vos identifiants :
```
MONGODB_URI=...
MONGODB_DB=...
```

## Démarrage
```bash
npm run dev
```

L'interface est accessible sur [http://localhost:3000/admin/projects](http://localhost:3000/admin/projects).

## Scripts utiles
- `npm run dev` : démarre le serveur de développement Next.js
- `npm run build` : build de production
- `npm run start` : exécute la version buildée
- `npm run lint` : analyse statique via ESLint

## Structure principale
```
src/
├─ app/
│  ├─ (admin)/admin/...
│  └─ api/...
├─ components/
├─ hooks/
├─ lib/
└─ schemas/
```

- `src/app/(admin)/admin/...` : pages listes/création/édition pour chaque collection
- `src/app/api/...` : routes REST (GET/POST/PUT) pour `projects`, `expertises` et `jobpositions`
- `src/components/` : composants UI (tables, badges) et formulaires JSON Forms
- `src/hooks/` : hooks SWR (`useProjects`, `useExpertises`, `useJobs`)
- `src/lib/` : connexion MongoDB, helpers ObjectId, sérialisation
- `src/schemas/` : schémas JSON et UI JSON Forms

## API
| Méthode | Route                         | Description                              |
|---------|-------------------------------|------------------------------------------|
| GET     | `/api/projects`               | Liste des projets (tri par année desc)   |
| POST    | `/api/projects`               | Création d'un projet                      |
| GET     | `/api/projects/[id]`          | Récupération d'un projet                  |
| PUT     | `/api/projects/[id]`          | Mise à jour partielle d'un projet         |
| GET     | `/api/expertises`             | Liste des expertises (tri par niveau)     |
| POST    | `/api/expertises`             | Création d'une expertise                  |
| GET     | `/api/expertises/[id]`        | Récupération d'une expertise              |
| PUT     | `/api/expertises/[id]`        | Mise à jour partielle d'une expertise     |
| GET     | `/api/jobpositions`           | Liste des postes (tri par _id desc)       |
| POST    | `/api/jobpositions`           | Création d'un poste                       |
| GET     | `/api/jobpositions/[id]`      | Récupération d'un poste                   |
| PUT     | `/api/jobpositions/[id]`      | Mise à jour partielle d'un poste          |
| POST    | `/api/seed`                   | Remplit ou met à jour les données de base |

Chaque réponse JSON sérialise `_id` en chaîne. Les routes POST/PUT retournent les documents mis à jour.

Pour initialiser vos collections, effectuez un `POST` sur `/api/seed`. Le script effectue des remplacements idempotents (upsert) sur les trois collections en conservant les mêmes identifiants pour permettre des relations cohérentes.

## Ajouter un champ à un formulaire
1. Modifiez le schéma JSON (`src/schemas/*.schema.json`) pour définir la propriété et son `title`.
2. Ajoutez la même propriété dans le UI Schema (`src/schemas/*.uischema.json`) pour contrôler l'ordre d'affichage.
3. L'API acceptera automatiquement ce champ côté création/mise à jour si vous l'ajoutez dans les validateurs correspondants (`src/app/api/<collection>/validators.ts`).
4. Aucun changement n'est requis dans les pages : JSON Forms met à jour les formulaires automatiquement.

## Assets
- Placez vos vignettes dans `public/thumbs/` et référencez-les via leurs URLs dans les formulaires.

## TypeScript
Le projet est en mode strict. Les helpers de sérialisation garantissent la cohérence des types entre l'API et l'UI.
