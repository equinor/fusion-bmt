FROM node:slim

RUN apt-get -y update && apt-get install -y git

WORKDIR /app
COPY . .
WORKDIR /app/frontend
RUN npm install

EXPOSE 3000
ENTRYPOINT npm run dev
