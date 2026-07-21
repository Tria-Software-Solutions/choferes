# Contributing to Choferes de Alquiler

Thank you for your interest in contributing. This document covers the development workflow, code style, and practical guidelines for working on this monorepo.

---

## Table of Contents

1. [Development Setup](#development-setup)
1. [Project Structure](#project-structure)
1. [Development Workflow](#development-workflow)
1. [Available Scripts](#available-scripts)
1. [Code Style & Linting](#code-style--linting)
1. [Testing](#testing)
1. [Database Migrations](#database-migrations)
1. [Orphan Data Cleanup](#orphan-data-cleanup)
1. [Pull Requests](#pull-requests)
1. [Docker](#docker)

---

## Development Setup

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 14 (or Docker)
- **Git**

### 1. Clone and Install

```bash
git clone <repo-url>
cd choferes
npm install
```

The monorepo uses npm workspaces — `npm install` at the root installs dependencies for all workspaces (`apps/*`, `packages/*`).

### 2. Build the Shared Package

Before running either app, build the shared types package:

```bash
npm run build --workspace=packages/shared
```

### 3. Configure Environment Variables

Create `.env` files for each app that needs one:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` with your PostgreSQL credentials. The required variables are listed in the [Environment Variables section](./README.md#environment-variables) of the root README.

> **Note:** There is no `.env.example` file committed yet — create one from the table in the README if needed.

### 4. Run Migrations and Seeders

```bash
cd apps/backend
npx sequelize-cli db:migrate --config src/config/config.js
npx sequelize-cli db:seed:all --config src/config/config.js
cd ../..
```

### 5. Start Development

```bash
npm run dev
```

This starts both apps in parallel via Turborepo:

- Frontend: <http://localhost:3000>
- API: <http://localhost:5000>

---

## Project Structure

```text
choferes/
├── apps/
│   ├── frontend/          # React SPA (Create React App)
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # Feature-based pages
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── services/    # Axios API clients
│   │   │   ├── store/       # Redux Toolkit slices
│   │   │   ├── theme/       # MUI themes (light, dark, high-contrast)
│   │   │   └── utils/       # Utility functions
│   │   └── package.json
│   │
│   └── backend/            # Express REST API
│       ├── src/
│       │   ├── controllers/ # HTTP request handlers
│       │   ├── middleware/   # Auth, roles, validation
│       │   ├── models/       # Sequelize models
│       │   ├── services/     # Business logic
│       │   ├── migrations/   # PostgreSQL migrations (JS)
│       │   ├── seeders/      # Seed data (JS)
│       │   ├── routes/       # Express route definitions
│       │   ├── scripts/      # CLI utilities
│       │   └── utils/        # Pagination, secret generation
│       └── package.json
│
├── packages/
│   └── shared/             # Shared TypeScript types & constants
│
├── docker-compose.yml      # Local Docker environment
├── turbo.json              # Turborepo pipeline config
└── package.json            # Root workspaces config
```

---

## Development Workflow

### Branch Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready code |
| `develop` | Active development — base your feature branches here |
| `feature/*` | New features (e.g., `feature/add-export-csv`) |
| `fix/*` | Bug fixes (e.g., `fix/login-redirect`) |
| `refactor/*` | Code improvements without feature changes |

### Commit Convention

This project uses **husky** + **lint-staged** as a pre-commit hook. Before each commit, staged files are automatically linted and formatted.

```bash
git commit -m "type(scope): short description"

# Examples:
# feat(backend): add overtime calculation endpoint
# fix(frontend): correct date picker timezone offset
# refactor(shared): extract validation regex to constants
# style(dock): improve hover animation timing
# docs(readme): update seed user passwords
# test(backend): add biweekly summary controller tests
```

**Pre-commit hook** runs: `npx lint-staged`

- Backend `*.{js,ts,tsx}` → `eslint --fix --max-warnings 100`
- Frontend `*.{js,ts,tsx}` → `eslint --fix --max-warnings 100`

If the hook fails, fix the reported issues and try again. You can bypass it with `--no-verify`, but this is discouraged.

---

## Available Scripts

### Root (Turborepo)

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend + backend in parallel |
| `npm run build` | Build all workspaces (shared → backend → frontend) |
| `npm run test` | Run tests across all workspaces |
| `npm run lint` | Run ESLint across all workspaces |
| `npm run format` | Run Prettier across all workspaces |

### Backend (`apps/backend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start with ts-node (hot reload on port 5000) |
| `npm run build` | TypeScript compile + copy `config.js` to `dist/` |
| `npm run start` | Start compiled production server |
| `npm run test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format |
| `npm run migrate:dev` | Run pending PostgreSQL migrations |
| `npm run seed:dev` | Seed initial data |
| `npm run cleanup:orphans` | Remove orphaned FK records |
| `npm run cleanup:orphans -- --dry-run` | Preview cleanup without deleting |

### Frontend (`apps/frontend`)

| Command | Description |
| --- | --- |
| `npm run dev` / `npm start` | Dev server on port 3000 |
| `npm run build` | Production build (output: `build/`) |
| `npm run test` | React Testing Library tests |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format |

---

## Code Style & Linting

### Rules

- **ESLint** — Airbnb-base style (backend) / react-app (frontend)
- **Prettier** — 100 char width, single quotes, trailing commas, LF line endings
- **TypeScript** — Strict mode enabled in both apps

### Backend Overrides

Some ESLint rules are relaxed in specific directories:

| Directory | Reason | Relaxed Rules |
| --- | --- | --- |
| `**/__tests__/**` | Test mocks need `any`, fixtures break import order | `no-explicit-any`, `import/order`, `prettier/prettier` |
| `**/services/**` | Sequelize v3 types require `Record<string, any>` | `no-explicit-any` |
| `**/scripts/**` | CLI scripts intentionally use `console.log` | `no-console`, `no-explicit-any` |
| `**/utils/pagination.ts` | Generic pagination helper needs `any` | `no-explicit-any` |

### Formatting

```bash
# Check formatting
npx prettier --check "apps/**/src/**/*.{js,ts,tsx,json,css,md}"

# Auto-fix formatting
npm run format
```

### Pre-commit Hooks

The husky pre-commit hook runs `lint-staged`, which lints only staged files. This keeps commits fast while ensuring code quality.

---

## Testing

### Backend

Tests use **Jest** + **Supertest** for integration testing:

```bash
cd apps/backend

# Run all tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

Key test patterns:

- Controllers are tested with a lightweight Express app via `createTestApp()`
- Services test business logic directly with mocked Sequelize
- All endpoints include at least one success and one error case
- Pagination tests verify boundary conditions (page 1, last page, empty results)

### Frontend

Tests use **React Testing Library** + **Jest**:

```bash
cd apps/frontend

# Run all tests
npm test

# Coverage
npm test -- --coverage
```

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs in three stages:

1. **Install** — Cache `node_modules` + build `packages/shared`
1. **Backend** (parallel) — Lint → Build → Test
1. **Frontend** (parallel) — Lint → Build → Test

Tests have `continue-on-error: true` so transient failures don't block the pipeline.

---

## Database Migrations

Migrations live in `apps/backend/src/migrations/` and use Sequelize CLI.

### Creating a Migration

```bash
cd apps/backend
npx sequelize-cli migration:generate --name <description>
```

Migrations are JavaScript files using `queryInterface` methods:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("table_name", "column_name", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("table_name", "column_name");
  },
};
```

### Running Migrations

```bash
npm run migrate:dev          # Development
NODE_ENV=production npm run migrate:prod   # Production
```

### Seeders

Seeders are in `apps/backend/src/seeders/`:

```bash
npm run seed:dev             # Seed all
npm run undo:seed:dev        # Undo all seeds
```

---

## Orphan Data Cleanup

When employees are deleted from the database, related records in `hours_worked`, `weekly_summary`, `biweekly_summary`, and `monthly_summary` can become orphaned.

Always use the dry-run flag first to preview what will be removed:

```bash
cd apps/backend

# Preview
npm run cleanup:orphans -- --dry-run

# Execute
npm run cleanup:orphans
```

The script aborts if the `employees` table is empty to prevent accidental mass deletion.

---

## Pull Requests

### Before Submitting

- [ ] Code compiles: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] Changes include tests (new features) or update existing tests (bug fixes)
- [ ] Documentation is updated (README, JSDoc, or inline comments)

### PR Checklist

1. Base branch should be `develop`
1. Title follows the commit convention: `type(scope): description`
1. Description explains **what** changed and **why**
1. Screenshots or screen recordings for UI changes
1. Link to any related issues

### Review Process

1. At least one approval is required before merging
1. All CI checks must pass (lint, build, test)
1. Squash-merge into `develop` is preferred

---

## Docker

A `docker-compose.yml` is available for local development with PostgreSQL:

```bash
# Start all services (PostgreSQL + API + Frontend)
docker compose up --build

# Start only the database
docker compose up db -d

# Stop everything
docker compose down

# Reset database volume
docker compose down -v
```

Docker services:

| Service | Port | Description |
| --- | --- | --- |
| `db` | 5433 | PostgreSQL 14 (Alpine) |
| `api` | 5001 | Express API |
| `ui` | 3000 | React SPA (Nginx) |
