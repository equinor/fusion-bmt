ARG dt_tenant
ARG dt_url

FROM ${dt_url}/e/${dt_tenant}/linux/oneagent-codemodules:all as DYNATRACE_ONEAGENT_IMAGE
FROM node:slim as build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install
COPY . .

#Dynatrace config
COPY --from=DYNATRACE_ONEAGENT_IMAGE / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so
ENV DT_TAGS=SHELLVIS

FROM node:slim
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT npm start
