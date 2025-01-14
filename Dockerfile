# =========================
# Stage 1: Base
# =========================
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the TypeScript application
RUN yarn build

# =========================
# Stage 4: Production Runtime
# =========================
FROM node:20-alpine AS prod-runtime
WORKDIR /app

# Copy built files and node_modules from the build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/yarn.lock ./yarn.lock

# Expose the backend port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the backend server
CMD ["yarn", "start"]
