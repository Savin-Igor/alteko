FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
# Postinstall hook needs the patch script available before `npm ci`
# resolves dependencies (the hook runs at the end of install).
COPY scripts/patch-payload-loadenv.cjs ./scripts/patch-payload-loadenv.cjs
# --legacy-peer-deps: @payloadcms/plugin-mcp ships a contradictory peer
# constraint on @modelcontextprotocol/sdk (deps: 1.27.1, peer: 1.26.0).
# npm 10 strict mode rejects this. Until Payload fixes upstream, fall
# back to the npm 6-era resolver, which matches what local `npm install`
# does and what the CI green path expects.
RUN npm ci --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV SKIP_ENV_VALIDATION=true
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# wget for healthcheck (smaller than curl on alpine).
# openssl required by Prisma: alpine 3.19+ has the right libssl already
# but the prisma binary's libssl probe needs the symlink layout that
# the openssl package provides.
RUN apk add --no-cache wget openssl

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI needed for migrate deploy in entrypoint. The prisma binary
# in .bin is a self-contained bundle that loads sibling .wasm files, so
# we copy the full .bin directory plus the @prisma/* tree (engines,
# client, schema-engine) and the prisma CLI package. Cheaper than
# dragging full node_modules; reliable enough for `prisma migrate deploy`.
# --chown lets the nextjs user write engine binaries Prisma may
# refresh at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Entrypoint: runs prisma migrate deploy, then exec CMD
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
