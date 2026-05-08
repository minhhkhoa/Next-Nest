# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URL_SERVER
ARG NEXT_PUBLIC_API_URL_SERVER_BASE
ARG NEXT_PUBLIC_API_URL_CLIENT

# Ensure all required NEXT_PUBLIC vars exist at build time.
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_URL_SERVER=$NEXT_PUBLIC_API_URL_SERVER \
    NEXT_PUBLIC_API_URL_SERVER_BASE=$NEXT_PUBLIC_API_URL_SERVER_BASE \
    NEXT_PUBLIC_API_URL_SERVER_TUNNEL=$NEXT_PUBLIC_API_URL_SERVER \
    NEXT_PUBLIC_API_URL_CLIENT=$NEXT_PUBLIC_API_URL_CLIENT \
    NEXT_PUBLIC_TOKEN_TEST=docker_build_token \
    NEXT_PUBLIC_CLOUD_API=https://api.cloudinary.com/v1_1 \
    NEXT_PUBLIC_PAGE_SIZE=10 \
    NEXT_PUBLIC_ROOT_PARENT_INDUSTRY_ID=000-00-000 \
    NEXT_PUBLIC_JWT_SECRET=docker_build_secret \
    NEXT_PUBLIC_ROLE_SUPER_ADMIN=SUPER_ADMIN \
    NEXT_PUBLIC_ROLE_RECRUITER=RECRUITER \
    NEXT_PUBLIC_ROLE_RECRUITER_ADMIN=RECRUITER_ADMIN \
    NEXT_PUBLIC_ROLE_CANDIDATE=CANDIDATE \
    NEXT_PUBLIC_ROLE_GUEST=GUEST \
    NEXT_PUBLIC_ROLE_CONTENT_MANAGER=CONTENT_MANAGER

RUN npm run build

FROM base AS prod-deps
COPY package*.json ./
RUN npm install --production && npm cache clean --force

FROM base AS runner
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
