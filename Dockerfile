# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install esbuild globally
RUN npm install -g esbuild

# Copy package files first to leverage Docker cache
COPY package*.json ./

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