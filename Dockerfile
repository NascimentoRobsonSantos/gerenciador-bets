# Stage 1: Build application
FROM node:20-alpine AS builder

ARG TZ=America/Sao_Paulo
ENV TZ=$TZ

RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo "${TZ}" > /etc/timezone

WORKDIR /app

# Copy package manifests first to leverage cache
COPY package*.json ./

# Install all dependencies (including devDependencies for the build step)
RUN npm install --legacy-peer-deps

# Copy the remaining source code
COPY . .

# Build production bundle
RUN NEXT_DISABLE_ESLINT=1 NEXT_DISABLE_TYPECHECK=1 npm run build

# Stage 2: Run application in production
FROM node:20-alpine

ARG TZ=America/Sao_Paulo
ENV TZ=$TZ

RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo "${TZ}" > /etc/timezone

WORKDIR /app

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy build artifacts
COPY --from=builder /app/.next ./.next

# Expose Next.js port
EXPOSE 3000

# Start application
CMD ["npm", "start", "--", "-H", "0.0.0.0"]