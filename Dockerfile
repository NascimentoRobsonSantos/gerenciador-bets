# Etapa 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package.json e package-lock.json primeiro (melhor uso do cache)
COPY package*.json ./

# Instalar TODAS as dependências (inclui devDependencies para conseguir rodar o build)
RUN npm install --legacy-peer-deps

# Copiar o restante do código
COPY . .

# Gerar build de produção
RUN NEXT_DISABLE_ESLINT=1 NEXT_DISABLE_TYPECHECK=1 npm run build

# Etapa 2: Rodar aplicação em produção
FROM node:20-alpine

WORKDIR /app

# Copiar apenas package.json e package-lock.json
COPY package*.json ./

# Instalar somente dependências necessárias em produção (sem devDependencies)
RUN npm install --omit=dev --legacy-peer-deps

# Copiar artefatos gerados no build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Porta usada pelo Next.js
EXPOSE 3000

# Rodar aplicação
CMD ["npm", "start"]
