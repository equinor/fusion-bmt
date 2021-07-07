# Cypress Tests

## Commands

-   `npm run cyopen` to open Cypress Runner
-   `npm run cyrun` to properly run tests

If multiple users/environments are needed, customize bmt commands by providing
`FRONTEND_PORT` and `API_URL` environment variables:

```
FRONTEND_PORT=3009 dotnet run --urls=http://localhost:5009
```

```
API_URL=http://localhost:5009 npm start -- -p 3009
```
