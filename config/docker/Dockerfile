# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install wget for health checks and esbuild for building
RUN apt-get update && apt-get install -y wget && \
    npm install -g esbuild && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage Docker cache
COPY config/node/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"] 