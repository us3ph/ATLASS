# ── ATLASS Backend Dockerfile ──
FROM node:20-alpine AS base

WORKDIR /app

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# ── Development ──
FROM base AS development
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── Build ──
FROM base AS build
RUN npm run build

# ── Production ──
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

EXPOSE 4000
CMD ["npm", "start"]
