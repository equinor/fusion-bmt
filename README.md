# Fusion BMT
[![Build Status](https://dev.azure.com/lambdaville/Fusion-BMT/_apis/build/status/equinor.fusion-bmt?branchName=refs%2Fpull%2F21%2Fmerge)](https://dev.azure.com/lambdaville/Fusion-BMT/_build/latest?definitionId=22&branchName=refs%2Fpull%2F21%2Fmerge)

Barrier Management Tool


We are using a Entity Framework SQL database for storing our data.
The environment variable "Database__ConnectionString" can be a ADO.NET connection string to an existing
database. If empty we use an InMemory database which is initialized with dummy data.
