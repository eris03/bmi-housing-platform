# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
# Optional: corporate/sandbox proxies that intercept TLS can pass their CA with
#   --secret id=ca_cert,src=/path/to/ca.crt   (never baked into the image)
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY apps/web/package.json apps/web/
RUN --mount=type=secret,id=ca_cert,required=false \
    if [ -f /run/secrets/ca_cert ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/ca_cert; fi; \
    corepack enable && pnpm install --frozen-lockfile --filter @bmi/web...
COPY packages packages
COPY apps/web apps/web
RUN pnpm --filter @bmi/contracts build && pnpm --filter @bmi/web build

FROM build AS runtime
ENV NODE_ENV=production
WORKDIR /repo/apps/web
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
