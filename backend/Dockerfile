FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build

WORKDIR /source
COPY . .
WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5000

# Runtime user change to non-root for added security
USER 1001
ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]
