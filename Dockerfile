# Multi-stage build for HeatGuard AI
# Stage 1: Build Vite React frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runtime with Node.js Express server
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and backend server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Ensure data folder can be created
RUN mkdir -p /app/server/data

# Default port (Cloud Run sets PORT=8080 automatically)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
