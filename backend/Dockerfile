# ─────────────────────────────────────────────────────
# Dockerfile — Como en Casa Backend
# ─────────────────────────────────────────────────────
# Multi-stage build para imagen de producción ligera.
# Etapa 1: Instalar dependencias
# Etapa 2: Copiar solo lo necesario (sin devDependencies)
# ─────────────────────────────────────────────────────

# ── Etapa 1: Dependencias ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ── Etapa 2: Producción ──
FROM node:20-alpine AS production
WORKDIR /app

# Seguridad: usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copiar código fuente
COPY server.js ./
COPY src/ ./src/

# Crear directorio de logs
RUN mkdir -p logs && chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Health check integrado en Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Arrancar
CMD ["node", "server.js"]
