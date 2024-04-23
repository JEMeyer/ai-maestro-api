# Use a minimal Node.js base image
FROM node:18-alpine as base

# Install PM2 globally
RUN npm install -g pm2

# Builder stage
FROM base AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files and the application source code to the working directory
COPY . .

# Install the application dependencies
RUN npm install

# Build the TypeScript code to JavaScript
RUN npm run build

# Final runtime image
FROM base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files from the builder image
COPY --from=builder /usr/src/app/package*.json ./

# Copy the built JavaScript files from the builder image
COPY --from=builder /usr/src/app/dist ./dist

# Install production dependencies
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Expose the port your application listens on
EXPOSE 4000

# Start the application using PM2
CMD ["pm2-runtime", "dist/web-api.js", "dist/proxy.js"]
