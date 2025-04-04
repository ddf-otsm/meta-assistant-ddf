# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    && npm install -g esbuild \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker cache
COPY config/node/package*.json ./

# Install dependencies without running husky install
RUN npm pkg delete scripts.prepare && \
    npm install && \
    npm install node-fetch@2

# Copy source code
COPY . .

# Build the application without type checking
ENV NODE_ENV=development
ENV SKIP_TYPE_CHECK=true
RUN npm run build:dev

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"] 