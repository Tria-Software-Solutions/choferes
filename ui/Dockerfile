### UI Dockerfile (multi-stage, serves static build with nginx)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Use legacy-peer-deps to avoid peer dependency conflicts during build
RUN npm ci --legacy-peer-deps
COPY . ./
RUN npm run build

FROM nginx:1.26-alpine AS runner
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY ./deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
