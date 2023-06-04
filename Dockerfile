FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY tsconfig.json .
COPY src src
RUN yarn build

FROM node:20-alpine
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app
COPY package.json .
RUN yarn install
COPY --from=builder /usr/src/app/dist/ .
COPY config.yml .
EXPOSE 8910
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]