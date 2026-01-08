# ===================================================================
# STAGE 1 : BASE
# ===================================================================
# Lightweight base image with necessary system compatibilities
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
# Defines the working directory in the container
WORKDIR /app

# ===================================================================
# STAGE 2 : DEPS (Dependencies)
# ===================================================================

# Installs dependencies only when package.json changes
FROM base AS deps

# Copy only the dependency files first
# → This allows Docker to hide this layer as long as package.json does not change
# → Huge time savings on rebuilds
COPY package.json package-lock.json* ./
# npm ci is faster and stricter than npm install for builds
RUN npm ci

# ===================================================================
# STAGE 3 : DEV (Full override for hot-reload)
# ===================================================================

# A development-ready image, useful if you want to test without a production build
# Can be targeted via "target:dev" in docker-compose if needed
FROM base AS dev

WORKDIR /app

# Copy node_modules from the builder to avoid reinstalling each time
COPY --from=deps /app/node_modules ./node_modules
# Copying the source code
COPY . .

# Variable to disable telemetry in Next.js (GDPR compliance + cleanliness)
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev"]

# ===================================================================
# STAGE 4 : BUILDER (Construction Prod)
# ===================================================================

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Without these lines, the "args:" statements of docker-compose are ignored by this stage.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG SKIP_ENV_VALIDATION

# These ARGs are injected as environment variables for the build command
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_ENV_VALIDATION=${SKIP_ENV_VALIDATION}

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Building the application (generates the .next folder)
# The build generates the .next/standalone folder
# Next.js will now "cook" (hardcode) the NEXT_PUBLIC_ variables in the JS
RUN npm run build

# ===================================================================
# STAGE 5 : RUNNER (Final Production)
# ===================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Creating a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copying public assets
COPY --from=builder /app/public ./public

# Preparing the .next folder with the correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 1. Copy of the optimized standalone build of Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 2. Copy of the input script (Monkey Patch infrastructure)
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.js ./entrypoint.js

# 3. Preparing permissions for configuration injection.
# We create a placeholder file and grant the necessary permissions to the nextjs user.
# Required to avoid the EACCES error when writing via entrypoint.js
RUN touch next.config.js && chown nextjs:nodejs next.config.js

USER nextjs

EXPOSE 3000

# 4. Startup via the entrypoint which patches server.js before launching it
CMD ["node", "entrypoint.js"]