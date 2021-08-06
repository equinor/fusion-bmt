FROM node:slim as build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY . .

FROM node:slim
COPY --from=build /app /app
WORKDIR /app
EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
