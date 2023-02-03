ARG DYNATRACE_PAAS_TOKEN
ARG DYNATRACE_TENANT
ARG DYNATRACE_URL
FROM ${DYNATRACE_URL}/e/${DYNATRACE_TENANT}/linux/oneagent-codemodules:all as dynatrace_repo
FROM node:lts-slim as build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY . .

FROM node:lts-slim
WORKDIR /app
COPY --from=build /app ./

#Dynatrace config
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
