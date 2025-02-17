# Runbook for Barrier Management Tool

### Prerequisites

-   [.NET 6.0+](https://dotnet.microsoft.com/download/dotnet/5.0)
-   [Node 16+ with npm 7+](https://github.com/nodesource/distributions/blob/master/README.md)
-   [Docker](https://docs.docker.com/engine/install/)

To run the project with docker-compose use:

-   `docker-compose up --build`

## Frontend

The frontend is built using TypeScript and components from the Equinor Design System ([EDS](https://eds.equinor.com/components/component-status/)).

### Run frontend

If no `API_URL` is provided, it will resolve to `https://backend-fusion-bmt-dev.radix.equinor.com`
which is the dev server from master. If you want to run frontend with local
backend, you need to provide explicitly `API_URL`. It can be set as an environment
variable, or the file `.env` in `frontend` can be created. A sample
file `.env.example` is provided.

```
cd frontend
npm install
npm start
```

### Updating the frontend schema

Any changes made to the database [model](backend/api/Models/Models.cs) or the
GraphQL [queries](backend/api/GQL/Query.cs) and
[mutations](backend/api/GQL/Mutation.cs) in the backend need to be communicated
to the frontend. This is done by running:

```bash
npm run schema
```

from the `/frontend`-directory. The changes must be checked in to git. Note
that for `npm run schema` to run properly the backend must be running and
[authorization must be turned off](#disable-authorization)

## Backend

The backend is build using .NET 6.0. We use GraphQL to handle requests
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

If you wish to interact with endpoints directly during development, [disable authorization](#disable-authorization).

The Schema used for the models in the backend can be found [here](https://backend-fusion-bmt-dev.radix.equinor.com/graphql?sdl).

### Disable authorization

It is sometimes useful to disable authorization for local development.
This can be done by commenting out `app.UseAuthorization();` line in [`backend/api/Startup.cs`](backend/api/Startup.cs)

Remember to change it back before committing!

### Run backend

```
cd backend/api
dotnet run
```

### Database model and EF Core

Our database model is defined in
[`/backend/api/Models/Models.cs`](/backend/api/Models/Models.cs) and we use
[Entity FrameWork Core](https://docs.microsoft.com/en-us/ef/core/) as an
object-relational mapper (O/RM). When making changes to the model, we also need
to create a new
[migration](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
and apply it to our databases.

#### Installing EF Core

```bash
dotnet tool install --global dotnet-ef
```

#### Creating a new migration

After making changes to the model run (from `/backend/api`):

```bash
dotnet ef migrations add {migration-name}
```

`add` will make changes to existing files and add 2 new files in
`backend/api/Migrations`, which all need to be checked in to git.

Note that the {migration-name} is just a descriptive name of your choosing.
Also note that `Database__ConnectionString` should be pointed at one of our
databases when running `add`. The reason for this is that the migration will be
created slightly different when based of the in-memory database. `add` will _not_
update or alter the connected database in any way.

If you for some reason are unhappy with your migration, you can delete it with

```bash
dotnet ef migrations remove
```

or simply delete the files and changes created by `add`. Once deleted you can
make new changes to the model and then create a new migration with `add`. Note
that you also need to [update the frontend
schema](#updating-the-frontend-schema).

#### Applying the migrations to the dev- and test database

For the migration to take effect, we need to apply it to our databases. To get
an overview of the current migrations in a database, set the correct
`Database__ConnectionString` for that database and run:

```bash
dotnet ef migrations list
```

This will list all migrations that are applied to the database and the local
migrations that are yet to be applied. The latter are denoted with the text
(pending).

To apply the pending migrations to the database run:

```bash
dotnet ef database update
```

If everything runs smoothly the pending tag should be gone if you run `list`
once more.

##### When to apply the migration to our databases

You can apply migrations to the dev database at any time to test that it
behaves as expected.

The prod and qa databases doesn't need to be updated manually, as all migrations are
applied to it automatically as part of the pipelines when pushed to qa and prod.

#### Populating databases with Questions

For populating SQL database with question templates go to `backend/scripts`
make sure your `Database__ConnectionString` is set and run
`dotnet run -t PATH-TO-FILE`. An example file of question templates:
`backend/api/Context/InitQuestions.json`

## Testing

We are using Cypress as a test framework for End to End tests. Details can be found
in [this section](frontend/cypress/README.md).

Cypress E2E tests can be run locally with:
`docker-compose -f docker-compose.cypress.yml up --build cypress`

To run locally the two last lines in frontend/cypress.Dockerfile should be
commented out.

Cypress tests will be run in Azure DevOps when pushing to the upstream branch cypress.
This can be done with the following command:
`git push upstream HEAD:cypress -f`

## Deploy

We have 4 different environments in use; dev, qa, prod and pr. Dev is the
environment that runs when pushing to master. Qa and prod will be created with
a [DevOps pipeline](https://dev.azure.com/Shellvis/Fusion-BMT/_build?definitionId=28&_a=summary)
when a new tag is created. The pr env is built on push to the pr branch.
Dev and pr will only deploy to Radix environment, while qa and prod will deploy
the frontend to Fusion.

### Dev

-   [dev frontend](https://frontend-fusion-bmt-dev.radix.equinor.com)
-   [dev backend](https://backend-fusion-bmt-dev.radix.equinor.com/swagger/index.html)

### QA

-   [qa fusion](https://pro-s-portal-fqa.azurewebsites.net/apps/bmt)

### Prod

-   [prod fusion](https://fusion.equinor.com/apps/bmt)

## Monitoring

We use Azure Application Insight to monitor our applications.

### Formatting

We use [Prettier](frontend/.prettierrc.json). Remember to set this up.

VSCode settings:

```
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.formatOnSave": true
```

[Page to edit Codacy settings](https://app.codacy.com/p/366408/patterns/list?engine=cf05f3aa-fd23-4586-8cce-5368917ec3e5)
