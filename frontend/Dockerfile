# Multi-stage Dockerfile for Angular frontend

# Base Node.js image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies stage
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

# Development stage
FROM dev-deps AS development
WORKDIR /app
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]

# Build stage
FROM dev-deps AS build
WORKDIR /app
COPY . .

# Build the Angular application
RUN npm run build --prod

# Test stage
FROM dev-deps AS test
WORKDIR /app
COPY . .
RUN npm run test:ci
RUN npm run lint

# Production base with nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx default configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]