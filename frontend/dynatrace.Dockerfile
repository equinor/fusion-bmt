ARG dt_tenant
ARG dt_url

FROM ${dt_url}/e/${dt_tenant}/linux/oneagent-codemodules:all as DYNATRACE_ONEAGENT_IMAGE
FROM node:lts-slim as build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY . .

FROM node:lts-slim
WORKDIR /app
COPY --from=build /app ./

#Dynatrace config
COPY --from=DYNATRACE_ONEAGENT_IMAGE / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so
ENV DT_TAGS=SHELLVIS

EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
