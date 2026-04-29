# TheGolfDraw Frontend

React + Vite + Tailwind CSS frontend for TheGolfDraw.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your backend origin. The default points to `http://localhost:5002`.

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Structure

- `src/app` - router, query client, layout shells, auth bootstrap
- `src/features/auth` - login, signup, pricing
- `src/features/dashboard` - subscriber dashboard
- `src/features/scores` - score management
- `src/features/draws` - published draws
- `src/features/charities` - charity discovery and detail
- `src/features/winners` - proof upload and winnings
- `src/features/admin` - admin dashboards and moderation tools
- `src/components/ui` - reusable primitives
- `src/lib` - API, auth store, formatting helpers

## Notes

- Route pages are lazy-loaded.
- Auth state is persisted in local storage.
- The app expects the backend route groups documented in `frontend.md`.