ARG DYNATRACE_PAAS_TOKEN
ARG DYNATRACE_TENANT
ARG DYNATRACE_URL
FROM ${DYNATRACE_URL}/e/${DYNATRACE_TENANT}/linux/oneagent-codemodules:all as dynatrace_repo
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build
WORKDIR /source

COPY . .

WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build /app ./

EXPOSE 5000

COPY --from=dynatrace_repo / /
RUN mkdir /logs && chown -R 1001:1001 /logs

#Dynatrace config
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
