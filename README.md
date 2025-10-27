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

Chaque réponse JSON sérialise `_id` en chaîne. Les routes POST/PUT retournent les documents mis à jour.

## Ajouter un champ à un formulaire
1. Modifiez le schéma JSON (`src/schemas/*.schema.json`) pour définir la propriété et son `title`.
2. Ajoutez la même propriété dans le UI Schema (`src/schemas/*.uischema.json`) pour contrôler l'ordre d'affichage.
3. L'API acceptera automatiquement ce champ côté création/mise à jour si vous l'ajoutez dans les validateurs correspondants (`src/app/api/<collection>/validators.ts`).
4. Aucun changement n'est requis dans les pages : JSON Forms met à jour les formulaires automatiquement.

## Assets
- Placez vos vignettes dans `public/thumbs/` et référencez-les via leurs URLs dans les formulaires.

## TypeScript
Le projet est en mode strict. Les helpers de sérialisation garantissent la cohérence des types entre l'API et l'UI.

## Sécurité

### Authentification et gestion des sessions
- Le formulaire de connexion poste vers [`/api/auth/login`](src/app/api/auth/%5B...nextauth%5D/route.ts) et vérifie les identifiants `ADMIN_IDENTIFIER` / `ADMIN_PASSWORD` définis dans l'environnement. Une session signée est ensuite stockée dans le cookie HTTP-only `admin-session`. 【F:src/app/api/auth/[...nextauth]/route.ts†L24-L72】【F:src/lib/auth/session.ts†L4-L105】
- Les sessions expirent après 6 heures par défaut (`DEFAULT_SESSION_MAX_AGE`). L'option « Se souvenir de moi » prolonge la durée à 30 jours via `REMEMBER_SESSION_MAX_AGE`. 【F:src/app/api/auth/[...nextauth]/route.ts†L49-L67】【F:src/lib/auth/session.ts†L5-L7】
- Pour révoquer une session utilisateur, appelez l'endpoint [`/api/auth/logout`](src/app/api/auth/%5B...nextauth%5D/route.ts) ou supprimez le cookie côté navigateur. Pour invalider toutes les sessions, faites pivoter `ADMIN_SESSION_SECRET` (ou, à défaut, `ADMIN_PASSWORD`) et relancez le déploiement : la signature des cookies ne correspondra plus et ils seront rejetés. 【F:src/app/api/auth/[...nextauth]/route.ts†L69-L99】【F:src/lib/auth/session.ts†L15-L53】

### Accès API authentifié
- Toutes les routes REST utilisent le garde [`guardAdminRequest`](src/lib/auth/api.ts) qui renvoie `401` en absence de session valide. 【F:src/lib/auth/api.ts†L1-L12】
- Les hooks clients (`useProjects`, `useExpertises`, etc.) consomment l'API via `fetcher/jsonFetch`, qui fusionnent automatiquement les en-têtes d'authentification exposés dans le DOM et forcent `credentials: "include"` afin d'envoyer le cookie de session sur chaque requête. 【F:src/lib/fetcher.ts†L63-L128】
- L'échec d'une requête authentifiée déclenche `useAuthRedirect`, qui renvoie l'utilisateur vers `/login`. 【F:src/hooks/useAuthRedirect.ts†L35-L45】

### Protection contre les SSRF et configuration des en-têtes
- L'endpoint d'aperçu de liens `/api/unfurl` résout l'hôte demandé, applique une deny/allow-list configurable (`UNFURL_DENY_HOSTS`, `UNFURL_ALLOW_HOSTS`) et rejette toute adresse IP privée ou réservée, limitant ainsi les attaques SSRF. Des garde-fous supplémentaires limitent le timeout, la taille et les redirections. 【F:src/app/api/unfurl/route.ts†L1-L229】【F:src/app/api/unfurl/route.ts†L229-L348】
- Le middleware global génère un nonce CSP et applique des en-têtes de sécurité (CSP stricte, `Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy`, etc.), adaptés à Vercel et au mode développement. 【F:middleware.ts†L1-L84】

### Variables d'environnement pour la production / Vercel
Configurez les variables suivantes avant un déploiement :

```bash
# Identifiants administrateur
ADMIN_IDENTIFIER="admin@example.com"
ADMIN_PASSWORD="motdepasse-complexe"
ADMIN_SESSION_SECRET="clé-aléatoire-longue"  # recommandé pour invalider les sessions sans changer le mot de passe

# Connexion base de données
MONGODB_URI="mongodb+srv://..."
MONGODB_DB="seed-portfolio"

# Aperçu de liens (SSRF)
UNFURL_ALLOW_HOSTS="example.com,*.trusted.tld"
UNFURL_DENY_HOSTS="internal.example.com"
```

Sur Vercel, placez ces variables dans l'onglet **Environment Variables** pour chaque environnement (`Preview`, `Production`). Pensez à redéployer après toute modification d'identifiants afin de propager la nouvelle configuration de session.
