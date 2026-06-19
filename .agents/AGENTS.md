# AGENTS.md

This is the project guide for AI coding agents. Keep it concise and use it as a map, not a full wiki. If an agent or IDE does not auto-load `.agents/AGENTS.md`, point it to this file before starting work.

## Project Snapshot

- Project: FCJ online ticketing system for events/movie-style ticket booking.
- Current implementation: React + TypeScript + Vite frontend, Node.js + Express backend.
- Important distinction: `docs/` includes future architecture ideas such as Redis, queues, AWS, and database work. Do not assume those are implemented. Base changes on the current code unless the task explicitly asks for future infrastructure.
- Main user flows: auth, event catalog/detail, seat/booking session, checkout/payment result, user tickets, staff check-in, admin dashboard.

## Repository Map

- `web/`: frontend app.
  - `src/domain/entities/`: frontend domain models.
  - `src/application/dtos/`: request/response DTO shapes.
  - `src/application/ports/`: service interfaces used by use cases.
  - `src/application/use-cases/`: frontend business/use-case logic.
  - `src/infrastructure/`: API clients, service implementations, auth/session/cache utilities.
  - `src/presentation/`: React pages, components, hooks, layouts, and router.
  - `src/styles/theme.css`: global design tokens; `src/index.css` contains global styles.
- `backend/`: Express API.
  - `src/domain/entities/`: backend domain entities.
  - `src/domain/errors/`: domain error types.
  - `src/application/use-cases/`: backend business logic.
  - `src/infrastructure/database/mock/`: in-memory/mock repositories.
  - `src/infrastructure/security/`: auth token and password helpers.
  - `src/presentation/controllers/`: HTTP controllers.
  - `src/presentation/routes/`: Express route factories.
  - `src/presentation/middlewares/`: auth, rate limit, error handling.
  - `src/routes/`: legacy routes kept temporarily; prefer the Clean Architecture path for new work.
- `docs/`: planning and requirement docs. Read only the relevant doc when task context needs it.
- `app/`: currently only contains a placeholder test file.

## Commands

Run commands from the package directory, not the repository root.

Frontend:

```bash
cd web
npm install
npm run dev
npm run lint
npm test
npm run build
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
npm start
```

Notes:

- Backend defaults to `PORT=3001`.
- Frontend expects API base URL from `VITE_API_BASE_URL`, defaulting to `http://localhost:3001/api`.
- Backend currently has no test or lint script. Do not report backend tests as run unless a script exists or the task adds one.

## Architecture Rules

- Preserve the current Clean Architecture direction.
- Keep domain rules in use cases, not in React components or Express route handlers.
- Backend HTTP flow should be route -> controller -> use case -> repository.
- Frontend UI flow should be page/hook/component -> use case -> port/service -> API client.
- Prefer adding or updating a port/service/use-case over calling `fetch` directly from UI code.
- Prefer mock repository changes in `backend/src/infrastructure/database/mock/` until the task explicitly adds a real database.
- Do not introduce Redis, queues, AWS services, payment gateways, or database migrations unless the task explicitly asks for that scope.
- Reuse existing entities, DTOs, hooks, services, and UI components before adding new abstractions.

## Frontend Conventions

- Use TypeScript and React function components.
- Use the `@/*` alias for imports from `web/src`.
- Keep page/component CSS beside the TSX file, following existing `ComponentName.tsx` + `ComponentName.css` folders.
- Use CSS variables from `src/styles/theme.css`; do not add Tailwind or another styling system unless requested.
- Routes live in `src/presentation/router/routes.ts` and `src/presentation/router/index.tsx`.
- Shared UI components live under `src/presentation/components/ui/`.
- Shared layout/state/display components live under `src/presentation/components/shared/` or `layouts/`.
- Tests use Vitest and Testing Library with jsdom.

## Backend Conventions

- Use ES modules (`import`/`export`), not CommonJS.
- Keep route files thin. Do validation/flow control in controllers or use cases as appropriate.
- Use `AppError` for expected application errors with HTTP status codes.
- Use the global `errorHandler` instead of manually formatting every failure in routes.
- Auth-protected routes should use `authMiddleware` and `requireRole` where appropriate.
- Return API responses in the existing envelope style: `{ success: true, data }` or `{ success: false, error }`.
- Keep temporary legacy routes working unless the task explicitly removes or migrates them.

## Testing And Verification

- For frontend logic or UI changes, run the narrowest relevant Vitest tests when possible, then `npm run lint` and `npm run build` if the change is broad.
- For backend changes, run the server or targeted manual/API checks when useful. State clearly when no automated backend tests exist.
- When a command cannot be run because dependencies are missing, environment is unavailable, or the sandbox blocks it, report that exactly.
- Do not claim verification that was not actually run.

## Agent Behavior

- Read this file first, then inspect only the relevant files for the task.
- Use `rg`/file search before broad directory scans.
- Keep changes scoped to the requested feature or bug.
- Do not rewrite unrelated files or reformat whole directories.
- Do not modify generated/build artifacts such as `node_modules`, `dist`, coverage output, or lockfiles unless dependency changes require it.
- If changing dependencies, update the relevant `package.json` and lockfile together.
- If existing docs conflict with current code, trust current code for implementation details and mention the discrepancy.
- In final responses, include changed files, commands run, and any remaining risk.
