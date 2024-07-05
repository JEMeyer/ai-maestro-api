# Use a minimal Node.js base image
FROM node:18-alpine as base

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Builder stage
FROM base AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Build the TypeScript code to JavaScript
RUN pnpm run build

# Final runtime image
FROM base

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files from the builder image
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy the built JavaScript files from the builder image
COPY --from=builder /app/dist ./dist

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Web API
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
