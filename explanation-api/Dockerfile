FROM node:22.23.2-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

USER node

EXPOSE 8090

CMD ["npm", "start"]
