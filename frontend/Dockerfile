FROM node:slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
