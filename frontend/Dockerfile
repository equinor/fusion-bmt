FROM node:slim

RUN apt-get -y update && apt-get install -y git

WORKDIR /app
COPY . .
WORKDIR /app/frontend
RUN npm install

EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
