# Cypress Tests

## Full setup

(Linux)

mock-oauth2server:

```
cd frontend
docker run -e "JSON_CONFIG_PATH=/mnt/conf/config.json" -v `pwd`/cypress/auth_server:/mnt/conf -p 8080:8080 ghcr.io/navikt/mock-oauth2-server:0.3.4
```

backend:

```
cd backend/api
ASPNETCORE_ENVIRONMENT=Test dotnet run --no-launch-profile
```

frontend:

```
cd frontend
npm start
```

cypress:

```
cd frontend
npm run cyrun
```

## Commands

-   `npm run cyopen` to open Cypress Runner
-   `npm run cyrun` to properly run tests

If multiple users/environments are needed, customize bmt commands by providing
`FRONTEND_PORT` and `API_URL` environment variables:

backend:

```
FRONTEND_PORT=3009 dotnet run --urls=http://localhost:5009
```

frontend:

```
API_URL=http://localhost:5009 npm start -- -p 3009
```

cypress:

```
npm run cyopen -- --env FRONTEND_PORT=3009,API_URL=http://localhost:5009
```

## Mock Authentication

### Mock OAuth2 Server

As we can't disable security during tests and are not allowed to create test
users in real Azure Directory, we have to mock AAD Authentication. To achieve
that we use [mock-oauth2-server](https://github.com/navikt/mock-oauth2-server).

It can be run as a standalone server for example like that:

```
docker run -e "JSON_CONFIG_PATH=/mnt/conf/config.json" -v /your/path/to/frontend/cypress/auth_server:/mnt/conf -p 8080:8080 ghcr.io/navikt/mock-oauth2-server:0.3.4
```

Server runs by default on `http://localhost:8080`. It doesn't matter what we
call the issuer used instead of Microsoft, so
[common](http://localhost:8080/common/.well-known/openid-configuration) was set
up.

Properties of interest in `cypress/auth_server/config.json`:

-   `"interactiveLogin": false` allows authentication without providing any
    credentials
-   `"requestParam": "mock_claims_for"` and `"match": "user_identification"`
    allow us to get the token with desired data
-   `"claims"` is a mix of standard claims, claims required by Microsoft
    Authentication and current fusion version. Claims will have to be extended
    once fusion validations are updated.

### backend/api

Environment variable `ASPNETCORE_ENVIRONMENT=Test` must be set for backend to
pick up `appsettings.Test.json` configuration, and dotnet must be run with no
profile as `Properties/launchSettings.json` overrides environment.

Fields of interest in "AzureAd" section:

-   `Authority` better match `"iss"` value in `auth_server/config.json`
-   `Audience` must match `"aud"` value in `auth_server/config.json`
-   `MetadataAddress` property must be set explicitly as it is not resolved
    correctly by MicrosoftIdentityWebApi by default
-   `RequireHttpsMetadata` must be disabled unless `"ssl"` section is configured
    in `auth_server/config.json`, keys/certificates are provided and all the
    code is updated to use https

### Cypress

Cypress has one major known limitation: it can't handle redirection to a totally
different domain. Thus Cypress own docs recommend similar flows:

1. conditionally disable real authentication code in the real app
2. authenticate programmatically in Cypress
3. save token in local storage

We can't fully use that flow because BMT authentication is fully handled by
fusion. In dev environment (fusion-cli/start-app) authentication is required
even before control returns to BMT. Hence current fusion code has at least 3
testability issues, which must be taken into account to minimize problems with
future upgrades:

1. automatic redirect to a different domain [Cypress limitation]
2. hard-coded Microsoft as login authority
3. old Implicit Grant flow [unsupported by mock-oauth2-server]

At the moment, with cache set correctly, Fusion performs only limited set of
validations on data, like checking for token expiry. Hence we can bypass all the
limitations by

1. programmatically acquiring the token from mock-oauth2-server
2. correctly setting FUSION_AUTH_CACHE to mock data and tokens
3. only then navigating to frontend page

Note that restricted resources will still perform all the validations and reject
our token.
