# =========================================================================
# The Neotia University - Enterprise HRMS Production Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Build Frontend Assets
FROM node:24-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --quiet
COPY client/ ./
RUN npm run build

# Stage 2: Production Runtime
FROM node:24-alpine AS production-runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install root dependencies
COPY package*.json ./
RUN npm ci --only=production --quiet

# Copy server code and built client bundle
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

# Security Hardening: Run as non-root node user
USER node

# Healthcheck probe for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

EXPOSE 5000
CMD ["node", "server/index.js"]
