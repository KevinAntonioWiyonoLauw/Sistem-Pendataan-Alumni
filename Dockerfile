# Use node:20-alpine as the base image for both development and production stages
FROM node:20-alpine AS builder

# Builder stage
# Install pnpm globally and add libc6-compat for Next.js compatibility on Alpine
RUN npm install -g pnpm && \
    apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Set environment variables for build time (optional, can be overridden by docker-compose)
ENV NEXT_TELEMETRY_DISABLED=1

# Build application
COPY . .
RUN pnpm build

# Final production image
FROM node:20-alpine AS runner
WORKDIR /app

# Additional environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Run application without root user to enhance security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
# Create public directory if it doesn't exist
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use nextjs user to run the application
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]