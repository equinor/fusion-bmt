FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /source

COPY . .

WORKDIR /source/api
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build /app ./

ENTRYPOINT ["dotnet", "api.dll", "--urls=http://0.0.0.0:5000"]

EXPOSE 5000
