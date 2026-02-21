FROM node:20-slim AS base
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY agent/package.json ./agent/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY shared/ ./shared/
COPY agent/ ./agent/

# Expose port
EXPOSE 4021

# Start agent
CMD ["pnpm", "--filter", "@realbase/agent", "run", "dev"]
