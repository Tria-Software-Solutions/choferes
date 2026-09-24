### UI Dockerfile (multi-stage) — build context = repo root (npm workspace)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
# CRA inyecta REACT_APP_* en build-time (runtime nginx no las usa)
ARG REACT_APP_API_URL=http://localhost:5001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm ci --legacy-peer-deps
COPY . ./
RUN npm run build -w @choferes/shared
RUN npm run build -w @choferes/frontend

FROM nginx:1.26-alpine AS runner
COPY --from=builder /usr/src/app/apps/frontend/build /usr/share/nginx/html
COPY ./apps/frontend/deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]