FROM cypress/base:10

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY . .

ENV XDG_CONFIG_HOME /app

ENTRYPOINT npm run cyrun -- \
--env FRONTEND_URL=http://frontend:3000,API_URL=http://backend:5000,AUTH_URL=http://mock-auth:8080 \
--config-file ./cypress.json \
--record --key ${CYPRESS_RECORD_KEY} \
--parallel --ci-build-id ${HOSTNAME}
