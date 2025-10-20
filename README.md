# Seed Portfolio Admin

Interface d'administration front-end construite avec [Vite](https://vitejs.dev/) et [JSON Forms](https://jsonforms.io/), basée sur les composants Material UI. Elle permet de gérer localement trois ensembles de données : projets, expertises et postes types.

## Fonctionnalités
- Formulaires dynamiques alimentés par JSON Forms et les schémas Eclipse JSON Forms
- Gestion des données en mémoire avec duplication, suppression et réinitialisation rapide
- Interface unifiée (mode sombre) utilisant la bibliothèque Material UI
- Données d'exemple préchargées pour tester l'ergonomie sans backend

## Démarrage rapide
```bash
npm install
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles
- `npm run dev` : lance le serveur de développement Vite
- `npm run build` : compile TypeScript et génère le bundle de production
- `npm run start` : prévisualise le build généré
- `npm run lint` : exécute ESLint sur les fichiers TypeScript/TSX
- `npm run test` : lance Vitest en mode couverture (configuration fournie, aucun test n'est défini par défaut)

## Structure du projet
```
src/
├─ components/       # Composants UI (table de données)
├─ data/             # Données d'exemple et helpers pour initialiser les formulaires
├─ schemas/          # Schémas JSON et UI Schema pour JSON Forms
├─ App.tsx           # Navigation par onglets et logique principale
└─ main.tsx          # Point d'entrée React + Material UI
```

Les schémas JSON Forms peuvent être adaptés facilement pour refléter votre propre modèle. Les données sont conservées en mémoire durant la session, ce qui facilite les itérations sur la modélisation avant de brancher un backend.
