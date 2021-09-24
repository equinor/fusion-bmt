ARG dt_tenant
ARG dt_url

FROM ${dt_url}/e/${dt_tenant}/linux/oneagent-codemodules:all as DYNATRACE_ONEAGENT_IMAGE
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build
WORKDIR /source

COPY . .

WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build /app ./

EXPOSE 5000

#Dynatrace config
COPY --from=DYNATRACE_ONEAGENT_IMAGE / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so
ENV DT_TAGS=SHELLVIS

# Runtime user change to non-root for added security
USER 1001

ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
