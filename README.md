# Barrier Management Tool

[![Build Status](https://dev.azure.com/Shellvis/Fusion-BMT/_apis/build/status/equinor.fusion-bmt?branchName=master)](https://dev.azure.com/Shellvis/Fusion-BMT/_build/latest?definitionId=22&branchName=master)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/45edba07b87447489c54a51867141261)](https://www.codacy.com/gh/equinor/fusion-bmt/dashboard?utm_source=github.com&utm_medium=referral&utm_content=equinor/fusion-bmt&utm_campaign=Badge_Grade)
[![BMT](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/ry3x7y&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ry3x7y/runs)

To run the project with docker-compose use:

-   `docker-compose up --build`

### Prerequisites

-   [.NET 5.0+](https://dotnet.microsoft.com/download/dotnet/5.0)
-   [Node 16+ with npm 7+](https://github.com/nodesource/distributions/blob/master/README.md)
-   [Docker](https://docs.docker.com/engine/install/)

## Frontend

The frontend is built using TypeScript and components from the Equinor Design System ([EDS](https://eds.equinor.com/components/component-status/)).

### Run frontend

```
cd frontend
npm install
npm start
```

### Formatting

We use [Prettier](frontend/.prettierrc.json). Remember to set this up.

VSCode settings:

```
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnSave": true
```

[Page to edit Codacy settings](https://app.codacy.com/p/366408/patterns/list?engine=cf05f3aa-fd23-4586-8cce-5368917ec3e5)

## Backend

The backend is build using .NET 5.0. We use GraphQL to handle requests
to the backend, and [Hot Chocolate](https://github.com/ChilliCream/hotchocolate)
is used as the implementation in .NET.

We are using a Entity Framework SQL database for storing our data.
The environment variable `Database__ConnectionString` can be a ADO.NET connection
string to an existing database. If empty we use an InMemory database which is
initialized with dummy data.

To start the backend, the file `launchSettings.json` in `backend/api/Properties`
needs to be created. A sample file `launchSettings.Template.json` is provided.

### GraphQL schema

When running locally, a playground server for trying out GraphQL queries will be
available at [localhost:5000/graphql](http://localhost:5000/graphql/).
This will not work properly in production, since the playground server will not provide a
bearer token for authentication. For generating a bearer token and try out the
API, the Swagger URL [localhost:5000/swagger](http://localhost:5000/swagger/index.html) can be used.

The Schema used for the models in the backend can be found [here](https://backend-fusion-bmt-dev.radix.equinor.com/graphql?sdl).

### Update frontend schema

When the data models in the backend changes, the corresponding models in frontend has to be updated as well. This is done by executing the command `npm run schema` in the fronend directory while the backend server is also running. Then there will be created an updated `models.ts` in the src/api folder which contains the updated models.

### Run backend

```
cd backend/api
dotnet run
```

## Testing
We are using Cypress as a test framework for End to End tests. Details can be found
in [this section](frontend/cypress/README.md).

Cypress E2E tests can be run locally with:
`docker-compose -f docker-compose.cypress.yml up cypress`

To run locally the two last lines in frontend/cypress.Dockerfile should be
commented out.

Cypress tests will be run in Azure DevOps when pushing to the upstream branch cypress.
This can be done with the following command:
`git push upstream HEAD:cypress -f`

## Configuration

### Database configuration

Make sure you have dotnet-ef installed: `dotnet tool install --global dotnet-ef`
and that you have set your `Database__ConnectionString`.

Check migrations existing in DB: `dotnet ef migrations list`

-   Create initial migration: `dotnet ef migrations add InitialCreate`
-   Delete database: `dotnet ef database drop`
-   Apply migrations: `dotnet ef database update`
-   Remove migrations: `dotnet ef migrations remove`
-   Roll back to earlier migration: `dotnet ef database update {migragtion-name}`

For populating SQL database with question templates go to `backend/scripts`
make sure your `Database__ConnectionString` is set and run
`dotnet run -t PATH-TO-FILE`. An example file of question templates:
`backend/api/Context/InitQuestions.json`

## Deploy

We have 3 different environments in use; dev, test and prod. Dev is the
environment that runs when pushing to master. Test and prod will run when
pushing to the specific branches. Dev will only deploy to Radix environment,
but Test and Prod will deploy the frontend to both Radix and Fusion.

Deploy to a specific environment is done by pushing a branch to the following
branch:

```
git push upstream master:prod -f
```

This deploys the local master to prod environment. Remember to pull from upstream
before performing this.

### Dev

-   [dev frontend](https://frontend-fusion-bmt-dev.radix.equinor.com)
-   [dev backend](https://backend-fusion-bmt-dev.radix.equinor.com/swagger/index.html)

### Test

-   [test radix](https://frontend-fusion-bmt-dev.radix.equinor.com)
-   [test fusion](https://pro-s-portal-fqa.azurewebsites.net/apps/bmt)

### Prod

-   [prod radix](https://fusion-bmt.app.radix.equinor.com/)
-   [prod fusion](https://fusion.equinor.com/apps/bmt)

## Model overview

![alt text](docs/model.png?raw=true "Simple domain model diagram")

### Etc

-   [Radix console](https://console.radix.equinor.com/applications/fusion-bmt)
-   [Fusion console](https://admin.ci.fusion-dev.net/apps)
-   [Figma drawings](https://www.figma.com/proto/wAzF4PAx9OPOoMGtsaju06/BMT?node-id=1%3A3110&viewport=650%2C493%2C0.052038900554180145&scaling=min-zoom)
-   [Microsoft Teams group](https://teams.microsoft.com/_#/conversations/Generelt?threadId=19:bfb40c49b3e2494fa69763c4bcf642a9@thread.tacv2&ctx=channel)
