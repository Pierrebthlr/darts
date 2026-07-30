# Darty Crousty

Darts scorer (501 + Cricket/Cutthroat) with a Firebase-backed shared leaderboard, player stats, and hot-zone tracking.

## Stack

Svelte + TypeScript + Vite. Deploys to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.

## Development

```
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run check     # type-check the whole project
```

## Firestore

Match data lives in the `matches` collection of the `darty-crousty-f4d80` Firebase project. Security rules are tracked in `firestore.rules` at the repo root (paste into Firestore Database → Rules in the Firebase console — this file is not auto-deployed).
