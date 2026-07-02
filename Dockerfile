FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat postgresql-client curl unzip
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Install kura (the Kyto config compiler, https://github.com/voidmute/kyto) —
# needed by the predev/prebuild "kura compile" hooks. It's a small NASM-assembly
# binary with no libc/runtime dependency, so it runs fine on Alpine.
RUN ASSET_URL="$(curl -fsSL https://api.github.com/repos/voidmute/kyto/releases/latest \
      | grep -o '"browser_download_url"[[:space:]]*:[[:space:]]*"[^"]*linux-x86_64\.zip"' \
      | head -n1 | sed -E 's/.*"(https[^"]+)"/\1/')" \
    && curl -fsSL "$ASSET_URL" -o /tmp/kyto.zip \
    && unzip -o -j /tmp/kyto.zip "*/kura" -d /usr/local/bin \
    && chmod +x /usr/local/bin/kura \
    && rm /tmp/kyto.zip \
    && kura --version

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/local/bin/kura /usr/local/bin/kura
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache postgresql-client bash tar wget

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/package.json ./

RUN mkdir -p /data/cloud /data/backups && chown -R nextjs:nodejs /data/cloud /data/backups

COPY docker-entrypoint.sh /docker-entrypoint.sh

# Fix Windows CRLF line endings from scp uploads; ensure scripts are executable
RUN sed -i 's/\r$//' /docker-entrypoint.sh && \
    find /app/scripts -name '*.sh' -exec sed -i 's/\r$//' {} \; && \
    chmod +x /docker-entrypoint.sh && \
    find /app/scripts -name '*.sh' -exec chmod +x {} \;

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
