# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
 RUN npm ci
#RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force
#RUN npm install

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variable
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]