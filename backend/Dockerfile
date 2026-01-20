# Backend Dockerfile - Production build

# Stage 1: Base image with Node.js
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Production dependencies
FROM base AS production-deps
RUN npm ci --only=production

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
