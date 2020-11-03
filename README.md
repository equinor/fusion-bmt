# Barrier Management Tool
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2df36390e188457bb6071c7a627a9f4c)](https://app.codacy.com/gh/equinor/fusion-bmt?utm_source=github.com&utm_medium=referral&utm_content=equinor/fusion-bmt&utm_campaign=Badge_Grade)
[![Build Status](https://dev.azure.com/lambdaville/Fusion-BMT/_apis/build/status/equinor.fusion-bmt?branchName=master)](https://dev.azure.com/lambdaville/Fusion-BMT/_build/latest?definitionId=22&branchName=master)

### Backend configuration
We are using a Entity Framework SQL database for storing our data.
The environment variable "Database__ConnectionString" can be a ADO.NET connection string to an existing
database. If empty we use an InMemory database which is initialized with dummy data.
