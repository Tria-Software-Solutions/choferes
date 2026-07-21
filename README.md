<!-- markdownlint-disable MD033 MD024 -->
<!-- MD033 disabled for inline HTML badge alignment. MD024 disabled for repeated sub-headings per section (e.g., Backend, Frontend). -->

# Choferes de Alquiler

<p align="center">
  <a href="https://github.com/lmhq-94/choferes/actions/workflows/ci.yml?branch=main">
    <img src="https://github.com/lmhq-94/choferes/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI (main)" />
  </a>
  <a href="https://github.com/lmhq-94/choferes/actions/workflows/ci.yml?branch=develop">
    <img src="https://github.com/lmhq-94/choferes/actions/workflows/ci.yml/badge.svg?branch=develop" alt="CI (develop)" />
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node >= 20" />
  <img src="https://img.shields.io/badge/turborepo-2.5-ef4444?logo=turborepo" alt="Turborepo 2.5" />
  <img src="https://img.shields.io/badge/license-proprietary-blue" alt="License" />
</p>

All-in-one management system for a chauffeur-driven vehicle rental company in Costa Rica.
Handles employees, schedules, worked hours, registered vehicles, and courier services,
with role-based authentication and permissions.

---

## Technology Stack

### Frontend (`apps/frontend`)

- **React 18** + **TypeScript 4.9** — SPA built with Create React App
- **Material UI 6** — Component system with light / dark / high-contrast themes
- **Redux Toolkit** — Global state with modular slices
- **React Router 7** — Client-side routing
- **Recharts** — Charts and visualizations on the Dashboard
- **Motion** — Animations (macOS-style interactive Dock)
- **React Hook Form** — Form handling

### Backend (`apps/backend`)

- **Node.js** + **Express 4** — REST API
- **Sequelize 4** + **PostgreSQL** — ORM with migrations and seeders
- **JWT** — Authentication with access + refresh tokens
- **Helmet** + **CORS** + **Rate Limiting** — Security
- **Express Validator** — Input validation
- **Jest** + **Supertest** — Integration tests (>90% coverage)

### Shared (`packages/shared`)

- Shared TypeScript types between frontend and backend
- Reusable constants and validations

### Infrastructure

- **Monorepo** with **Turborepo** + npm workspaces
- **CI/CD** — GitHub Actions (lint → build → test in parallel)
- **Docker** — Containers for local development
- **Vercel** — Frontend hosting
- **Render** — Backend hosting

---

## Architecture

```text
├── apps/
│   ├── frontend/              # React SPA
│   │   └── src/
│   │       ├── components/    # Reusable components (Tables, Modals, etc.)
│   │       ├── constants/     # UI constants, permissions, routes
│   │       ├── context/       # AuthContext, NotificationContext
│   │       ├── hooks/         # Custom hooks (useAuth, useTable*, use*Summary)
│   │       ├── models/        # TypeScript interfaces
│   │       ├── pages/         # Feature-based pages
│   │       ├── services/      # API clients (axios)
│   │       ├── store/         # Redux store + slices
│   │       ├── theme/         # Light, dark, and high-contrast themes
│   │       └── utils/         # Utilities (dates, export, masks)
│   │
│   └── backend/               # Express REST API
│       └── src/
│           ├── controllers/   # HTTP handlers
│           ├── database/      # Connection and associations
│           ├── middleware/    # JWT auth + roles + validation
│           ├── migrations/    # PostgreSQL migrations
│           ├── models/        # Sequelize models
│           ├── routes/        # Route definitions
│           ├── scripts/       # CLI utilities (cleanup-orphans)
│           ├── seeders/       # Seed data
│           ├── services/      # Business logic
│           └── utils/         # Utilities (pagination, secret generation)
│
├── packages/
│   └── shared/                # Shared types and constants
│       └── src/
│           ├── types/         # Shared interfaces (User, Employee, etc.)
│           ├── constants/     # Shared constants
│           └── validations/   # Validation rules (regex)
│
├── docker-compose.yml         # Local Docker environment
├── turbo.json                 # Turborepo orchestration
└── package.json               # Root workspaces
```

---

## Features

### Authentication & Roles

- Secure JWT login (access + refresh tokens)
- Granular roles: Management, Administrative, HR
- Action-based permissions (create, edit, delete, export)

### Employees

- Full CRUD with multi-field search
- Excel / PDF export with grouped headers
- View by schedule or by employee

### Schedules

- Shift definition with weekdays and hours
- Support for special schedules (day off, holidays)

### Worked Hours

- Daily recording per employee and schedule
- Automatic weekly, biweekly, and monthly summaries
- Manual hour adjustments
- Auto-generation with balanced distribution

### Vehicles

- Registration: ticket, license plate, brand, color, parking spot
- Auto-complete data from previous records
- OCR scanning via Gemini Vision API

### Dashboard

- Hour statistics by period (weekly / biweekly / monthly)
- Top employees by hours
- Overtime alerts
- Daily attendance average
- Schedule distribution
- Vehicle brand distribution
- Fully responsive

### Themes

- Light mode
- Dark mode
- High contrast (accessibility)

---

## Installation

### Requirements

- Node.js >= 20
- npm 10+
- PostgreSQL 14+
- Docker (optional)

### Quick Setup

```bash
# 1. Clone and install (from monorepo root)
git clone <repo-url>
cd choferes
npm install

# 2. Build the shared package
npm run build --workspace=packages/shared

# 3. Configure backend environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with PostgreSQL credentials

# 4. Run migrations and seeders
cd apps/backend
npx sequelize-cli db:migrate --config src/config/config.js
npx sequelize-cli db:seed:all --config src/config/config.js
cd ../..

# 5. Start development server
npm run dev
```

### Using Docker

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Frontend: <http://localhost:3000>
- API: <http://localhost:5001>
- PostgreSQL: localhost:5433

---

## Available Scripts

### From Root (Turborepo)

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend + backend in parallel |
| `npm run build` | Build all workspaces |
| `npm run test` | Run tests across all workspaces |
| `npm run lint` | Run ESLint across all workspaces |

### Backend (`apps/backend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start server with ts-node (hot reload) |
| `npm run build` | Compile TypeScript to JS + copy config |
| `npm run start` | Start production server |
| `npm run test` | Unit + integration tests (Jest) |
| `npm run test:coverage` | Coverage report |
| `npm run lint` | ESLint |
| `npm run migrate:dev` | Run migrations |
| `npm run seed:dev` | Seed initial data |
| `npm run cleanup:orphans` | Remove orphaned FK records |
| `npm run cleanup:orphans -- --dry-run` | Preview without deleting |

### Frontend (`apps/frontend`)

| Command | Description |
| --- | --- |
| `npm run dev` / `npm start` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run test` | Tests (React Testing Library) |
| `npm run lint` | ESLint |

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description |
| --- | --- |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | Port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET_KEY` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `PORT` | Server port (default: 5000) |

### Frontend (`apps/frontend/.env`)

| Variable | Description |
| --- | --- |
| `REACT_APP_API_URL` | Backend API URL |

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs in parallel:

1. **Install** — Install dependencies and build `packages/shared`
1. **Backend** — Lint → Build → Test
1. **Frontend** — Lint → Build → Test

Tests have `continue-on-error: true` to avoid blocking the pipeline on transient failures.

---

## Seed Users (Development)

| Username | Password | Role |
| --- | --- | --- |
| `danilumix` | `Gerencia123$` | Management |
| `damarisa` | `Admin123$` | Administrative |
| `carlosc` | `678900CS$` | HR |
| `lmhq94` | `Admin123$` | Administrative (inactive) |

---

## Orphan Data Cleanup

When employees are deleted from the database, their records in `hours_worked`, `weekly_summary`,
`biweekly_summary` and `monthly_summary` may become orphaned. To clean them up:

```bash
# Preview (dry-run — does not delete anything)
cd apps/backend && npm run cleanup:orphans -- --dry-run

# Run cleanup
npm run cleanup:orphans
```

The script aborts if the `employees` table is empty to prevent accidental mass deletion.

---

## License

All rights reserved © 2024-2026
