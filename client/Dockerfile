# syntax=docker/dockerfile:1.7
# ---------- Build stage ----------
# Node 20 LTS keeps parity with modern tooling while staying lightweight (Alpine)
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using package manager cache
COPY package.json package-lock.json* .npmrc* ./
RUN npm install

# Copy the rest of the source after deps to leverage Docker layer caching
COPY . .

# Allow the API URL to be injected at build time (default to /api to support reverse proxying)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:alpine AS runtime

# Copy custom nginx config that handles SPA routing and static caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
