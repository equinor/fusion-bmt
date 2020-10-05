FROM node:alpine

WORKDIR /app
COPY . .
RUN npm install -g serve
RUN npm install

EXPOSE 3000
ENTRYPOINT npm run build && serve -s build -l 3000
