FROM node:23-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production deps stage
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Final stage
FROM node:23-alpine AS runner
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY prompts ./prompts
COPY drizzle ./drizzle
COPY public ./public

ENV NODE_ENV=production
EXPOSE 443

CMD ["node", "dist/src/index.js"]
