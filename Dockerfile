FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Generate Prisma Client
RUN npm run prisma:generate

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
