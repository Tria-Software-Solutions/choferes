<!-- markdownlint-disable MD024 MD051 -->
<!-- MD024 disabled for repeated sub-headings across sections. MD051 disabled for anchor mismatches with em-dash characters. -->

# Deployment Guide

This document covers production deployment for all components of the Choferes de Alquiler stack.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
1. [Architecture Overview](#architecture-overview)
1. [Frontend — Vercel](#frontend--vercel)
1. [Backend — Render](#backend--render)
1. [Docker Deployment](#docker-deployment)
1. [Environment Variables Reference](#environment-variables-reference)
1. [CI/CD Pipeline](#cicd-pipeline)
1. [Post-Deployment Checklist](#post-deployment-checklist)
1. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** 14+ (production instance, e.g., Render, AWS RDS, Supabase)
- **Vercel** account (frontend hosting)
- **Render** account (backend hosting) — or alternative Node.js host
- **GitHub** repository (for CI/CD)

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────┐
│                      Vercel                          │
│  ┌──────────────────────────────────────────────┐   │
│  │         React SPA (apps/frontend)             │   │
│  │  REACT_APP_API_URL → https://api.example.com  │   │
│  └──────────────┬───────────────────────────────┘   │
└─────────────────┼───────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────┐
│                      Render                          │
│  ┌──────────────────────────────────────────────┐   │
│  │     Express API (apps/backend) :5000           │   │
│  │       Helmet + CORS + Rate Limiting           │   │
│  └──────────────┬───────────────────────────────┘   │
└─────────────────┼───────────────────────────────────┘
                  │ TCP :5432
┌─────────────────▼───────────────────────────────────┐
│                   PostgreSQL 14+                      │
│              (Render DB / AWS RDS / Supabase)         │
└─────────────────────────────────────────────────────┘
```

---

## Frontend — Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
1. Import your GitHub repository (`lmhq-94/choferes`)
1. Set the **Root Directory** to `apps/frontend`
1. Vercel will auto-detect Create React App settings

### 2. Configure Build Settings

| Setting | Value |
| --- | --- |
| **Framework** | Create React App |
| **Root Directory** | `apps/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build/` |
| **Node Version** | 20.x |

### 3. Environment Variables

Add the following environment variable in Vercel dashboard → Project Settings → Environment Variables:

| Name | Value | Environments |
| --- | --- | --- |
| `REACT_APP_API_URL` | `https://your-api.onrender.com` | Production, Preview |

### 4. Deploy

Vercel automatically deploys:

- **Production** — pushes to `main` branch
- **Preview** — pull requests and pushes to other branches

You can also trigger a manual deploy from the Vercel dashboard.

### 5. Custom Domain (Optional)

1. Go to Project → **Domains**
1. Add your custom domain (e.g., `app.choferes-alquiler.com`)
1. Update your DNS (Vercel provides the target records)

---

## Backend — Render

### 1. Create a Web Service

1. Go to [render.com](https://render.com) → **Dashboard** → **New +** → **Web Service**
1. Connect your GitHub repository (`lmhq-94/choferes`)
1. Configure the service:

| Setting | Value |
| --- | --- |
| **Name** | `choferes-api` |
| **Root Directory** | `apps/backend` |
| **Runtime** | Node |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start` |
| **Node Version** | 20 |

### 2. Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` (Render sets this automatically) |
| `DB_HOST` | PostgreSQL host | `your-db-host.render.com` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `choferes_prod` |
| `DB_USER` | Database user | `choferes_user` |
| `DB_PASSWORD` | Database password | `(use a strong random password)` |
| `JWT_SECRET_KEY` | Access token secret | `(generate with openssl rand -hex 64)` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `(generate with openssl rand -hex 64)` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://app.choferes-alquiler.com` |

Render automatically assigns the `PORT` environment variable. The `npm run start` command runs `node dist/src/server.js`.

### 3. Database Setup

#### Option A: Render PostgreSQL (recommended)

1. Go to Render Dashboard → **New +** → **PostgreSQL**
1. Note the **Internal Database URL** and individual credentials
1. Run migrations from your local machine (or via a one-off script):

```bash
# From local (after configuring .env with Render DB credentials)
cd apps/backend
npm run migrate:prod

# Seed data (development only — skip for fresh production)
NODE_ENV=production npm run seed:prod
```

> **Important:** Database migrations are manual. There is no auto-migrate in production. Run them via a Render Shell or from your local machine with production DB credentials.

#### Option B: External Provider (AWS RDS, Supabase, etc.)

1. Get the connection string and credentials from your provider
1. Ensure the database is publicly accessible (or on the same private network)
1. Configure the `DB_*` environment variables accordingly

### 4. Health Check

Render provides a health check endpoint. Configure it to hit:

```text
https://your-api.onrender.com/api/health
```

### 5. Custom Domain (Optional)

1. Go to your Render service → **Settings** → **Custom Domain**
1. Add your domain (e.g., `api.choferes-alquiler.com`)
1. Update DNS (CNAME to `onrender.com` or as instructed)

---

## Docker Deployment

You can deploy the entire stack with Docker Compose or run individual containers.

### Full Stack with Docker Compose

```bash
# 1. Clone the repository
git clone <repo-url>
cd choferes

# 2. Create .env file with production values
cat > .env << EOF
POSTGRES_USER=choferes
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=choferes_prod
JWT_SECRET_KEY=<openssl rand -hex 64>
JWT_REFRESH_SECRET=<openssl rand -hex 64>
EOF

# 3. Build and start all services
docker compose up --build -d

# 4. Run migrations and seeders
docker compose exec api npm run migrate:prod
docker compose exec api npm run seed:prod
```

### Standalone Backend Container

```bash
cd apps/backend
docker build -t choferes-api .
docker run -d \
  --name choferes-api \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DB_HOST=... \
  -e DB_PORT=5432 \
  -e DB_NAME=choferes_prod \
  -e DB_USER=... \
  -e DB_PASSWORD=... \
  -e JWT_SECRET_KEY=... \
  -e JWT_REFRESH_SECRET=... \
  -e CORS_ORIGIN=https://your-app.vercel.app \
  choferes-api
```

### Standalone Frontend Container

The frontend Docker image serves the built SPA via Nginx:

```bash
cd apps/frontend
docker build -t choferes-ui .
docker run -d \
  --name choferes-ui \
  -p 80:80 \
  -e REACT_APP_API_URL=https://your-api.onrender.com \
  choferes-ui
```

The Nginx configuration (at `apps/frontend/deploy/nginx/default.conf`) proxies `/api/` requests to the backend, so you may need to adjust it for your backend URL if not using Docker networking.

---

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | — | `production` for live deployment |
| `PORT` | No | `5000` | Server port (Render sets this) |
| `DB_HOST` | Yes | — | PostgreSQL hostname |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | — | Database name |
| `DB_USER` | Yes | — | Database user |
| `DB_PASSWORD` | Yes | — | Database password |
| `JWT_SECRET_KEY` | Yes | — | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Secret for signing refresh tokens (min 32 chars) |
| `CORS_ORIGIN` | No | `*` | Allowed frontend origin for CORS headers |

### Frontend

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `REACT_APP_API_URL` | Yes | — | Backend API base URL (no trailing slash) |

> **Security:** Generate strong secrets with:
> ```bash
> openssl rand -hex 64
> ```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main` and `develop`, and on all pull requests.

### Pipeline Stages

```text
Install  (cache node_modules + build shared dist)
   ├── Backend   (lint → build → test)
   └── Frontend  (lint → build → test)
```

### What It Does

1. **Install stage** — Caches `node_modules`, builds `packages/shared`, uploads the dist as an artifact
1. **Backend** — Runs ESLint, TypeScript compilation, and Jest tests
1. **Frontend** — Runs ESLint, React production build, and React Testing Library tests

Tests have `continue-on-error: true` so transient failures don't block the pipeline.

### Required Secrets for CI

The CI pipeline uses only public steps (no secrets required). Deployment secrets should be configured directly on Vercel and Render, not in the CI pipeline.

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] Frontend loads at the correct URL
- [ ] API health check returns `200 OK`
- [ ] Login flow works end-to-end
- [ ] Employee CRUD operations succeed
- [ ] Schedule creation and assignment work
- [ ] Hours recording and summary calculations work
- [ ] Vehicle registration works (including OCR if configured)
- [ ] CORS is properly configured (no cross-origin errors in browser console)
- [ ] Rate limiting is active (rapid requests return `429 Too Many Requests`)
- [ ] HTTPS is enforced (no insecure content warnings)
- [ ] Seed users can log in (if seeded)
- [ ] Database migrations are up to date

---

## Troubleshooting

### Frontend shows blank page

```text
Possible causes:
- REACT_APP_API_URL is missing or wrong in Vercel
- Build failed silently → check Vercel build logs
- Browser console shows CORS errors → check backend CORS config
- React Router needs fallback (Vercel handles this automatically for CRA)
```

### Backend returns 500 errors

```text
Check Render logs → look for:
- SequelizeConnectionError → DB_HOST, DB_USER, or DB_PASSWORD is wrong
- JsonWebTokenError → JWT_SECRET_KEY or JWT_REFRESH_SECRET is missing or changed
- ECONNREFUSED → Database is not reachable (check firewall / private networking)

Run migrations:
  cd apps/backend && npm run migrate:prod
```

### CORS errors in browser

```text
Ensure CORS_ORIGIN in the backend environment matches the exact frontend URL
(including https:// and no trailing slash).

Examples:
  ✅ CORS_ORIGIN=https://app.choferes-alquiler.com
  ❌ CORS_ORIGIN=https://app.choferes-alquiler.com/
  ❌ CORS_ORIGIN=app.choferes-alquiler.com
```

### Database connection refused

```text
For Render PostgreSQL:
1. Verify the database is in the same region as the API service
2. Check that the API service has access (Render internal networking)
3. Use the Internal Database URL (not the public one) when both services are on Render

For external providers:
1. Ensure the database allows connections from the API's IP
2. Check firewall rules and security groups
3. Verify SSL/TLS requirements (add ?sslmode=require if needed)
```

### Migration fails

```text
# Check current migration state
cd apps/backend && npx sequelize-cli db:migrate:status --config src/config/config.js

# Undo the last migration if it failed mid-way
npx sequelize-cli db:migrate:undo --config src/config/config.js

# Retry
npm run migrate:prod
```
