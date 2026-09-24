### API Dockerfile (multi-stage) — build context = repo root (npm workspace)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci
COPY . ./
RUN npm run build -w @choferes/backend

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Reuse the workspace-installed deps from the builder (hoisted at root)
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/src/config/config.js ./apps/backend/dist/config/config.js
COPY --from=builder /usr/src/app/apps/backend/src/migrations ./apps/backend/dist/src/migrations
COPY --from=builder /usr/src/app/apps/backend/.sequelizerc ./apps/backend/
WORKDIR /usr/src/app/apps/backend
EXPOSE 5000
CMD ["node", "dist/src/server.js"]