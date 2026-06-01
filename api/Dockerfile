### API Dockerfile (multi-stage)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /usr/src/app/dist ./dist
COPY src/config/config.js ./dist/config/config.js
COPY --from=builder /usr/src/app/src/migrations ./dist/src/migrations
COPY .sequelizerc ./
EXPOSE 5000
CMD ["node", "dist/src/server.js"]
