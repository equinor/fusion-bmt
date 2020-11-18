FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /source

COPY . .

WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
COPY --from=build /app ./

ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]

EXPOSE 5000
