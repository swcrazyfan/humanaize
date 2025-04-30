# syntax = docker/dockerfile:1

# --- Base Stage ---
# Use the specific Node version from the original Dockerfile
FROM node:22.13.1-slim AS base

# Default port, can be overridden
ARG PORT=3000

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# --- Dependencies Stage ---
FROM base AS dependencies

# Copy only package files
COPY package.json package-lock.json ./
# Install production dependencies using npm ci for consistency
RUN npm ci

# --- Build Stage ---
FROM base AS build

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .

# Build the Next.js application
# Public build-time env vars can be passed here if needed using ARG/ENV
# Example: ARG NEXT_PUBLIC_EXAMPLE_VAR
# Example: ENV NEXT_PUBLIC_EXAMPLE_VAR=$NEXT_PUBLIC_EXAMPLE_VAR
RUN npm run build

# --- Runner Stage ---
FROM base AS runner

ENV NODE_ENV=production
# Use the PORT ARG defined in the base stage
ENV PORT=$PORT

# Create non-root user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create the .next directory specifically for the standalone output
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy necessary files from the build stage
# Copy public assets
COPY --from=build /app/public ./public
# Copy standalone server files
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE $PORT

# Set the host to listen on all interfaces
ENV HOSTNAME="0.0.0.0"

# Start the Node.js server using the standalone output
# Note: The entrypoint is server.js in the standalone output directory
CMD ["node", "server.js"]
