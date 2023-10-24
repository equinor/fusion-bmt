# Barrier Management Tool

[![Build Status](https://dev.azure.com/Shellvis/Fusion-BMT/_apis/build/status/equinor.fusion-bmt?branchName=master)](https://dev.azure.com/Shellvis/Fusion-BMT/_build/latest?definitionId=22&branchName=master)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/898e3ea418fb495aa2abdbb02633bf9d)](https://www.codacy.com/gh/equinor/fusion-bmt/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=equinor/fusion-bmt&amp;utm_campaign=Badge_Grade)
[![BMT](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/ry3x7y&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ry3x7y/runs)

**Dev**: [![Dev Build Status!](https://api.radix.equinor.com/api/v1/applications/fusion-bmt/environments/dev/buildstatus)](https://console.radix.equinor.com/applications/fusion-bmt/envs/dev)
**QA**: [![QA Build Status](https://api.radix.equinor.com/api/v1/applications/fusion-bmt/environments/qa/buildstatus)](https://console.radix.equinor.com/applications/fusion-bmt/envs/qa)
**Prod**: [![Prod Build Status](https://api.radix.equinor.com/api/v1/applications/fusion-bmt/environments/prod/buildstatus)](https://console.radix.equinor.com/applications/fusion-bmt/envs/prod)

## Runbook

[Runbook](https://github.com/equinor/fusion-bmt/blob/master/docs/runbook.md) can be found in this repo.

## Test strategy

We are using Cypress to create a suite of automated functional regression tests.

We aim to create a system that

**'describes and validates the behavior of the system as seen from a user perspective'.**

This implicitly ensures that business requirements are tested (covered by
tests).

The automated tests run in a CI pipeline.

### BDD style coding in Cypress

In the majority of the tests we adopt a **BDD style** coding.

This means that we in the testcase describe the user actions and the behavior
of the software using a ubiquitous language based on English. (A ubiquitous
language is a vocabulary shared by all stakeholders.)

See here for more information:
https://en.wikipedia.org/wiki/Behavior-driven_development

### Organization of tests

The tests are organized after pages and areas of concern (major capabilities)
for the users of the application.
The tests for each area of concern or each page reside in their respective
`_spec.ts` file.

One example of an area of concern is actions management (creation, editing,
completing, voiding, viewing on different stages of actions).
The set of tests for action management reside in `actions_spec.ts`.
Each test in the set of tests tests one specific capability in the area of
concern or on the page.
One example from `actions_spec.ts` is Creating and editing actions.

We use parameterization of tests extensively to iterate over sets of input values.

#### Randomization of test data

In many tests we use randomization to select one random element from a
a set of possible input values where BMT behaves equivalent for any of
those input values.

For instance, the progression of an evaluation is often chosen randomly from
a list of progressions. Which progressions that are included in this list
are determined based on the behavior that is being verified.

#### Lifecycle

We develop the tests immideately after the relevant functionality is developed
in separate PRs.

### Mocking of external systems

We mock authentication and the integration with the Fusion framework but we have
no type safety for these mocks.

To mitigate these risks we employ short sessions of exploratory testing prior
to release into production.

## Environments

We have 4 different environments in use; dev, qa, prod and pr. 

### Dev

-   [dev frontend](https://frontend-fusion-bmt-dev.radix.equinor.com)
-   [dev backend](https://backend-fusion-bmt-dev.radix.equinor.com/swagger/index.html)

### QA

-   [qa fusion](https://pro-s-portal-fqa.azurewebsites.net/apps/bmt)

### Prod

-   [prod fusion](https://fusion.equinor.com/apps/bmt)

## Monitoring

We use both Azure Application Insight and dynatrace to monitor our applications.

## Model overview

![alt text](docs/model.png?raw=true "Simple domain model diagram")

### Etc

-   [Radix console](https://console.radix.equinor.com/applications/fusion-bmt)
-   [Fusion console](https://admin.ci.fusion-dev.net/apps)
-   [Figma drawings](https://www.figma.com/proto/wAzF4PAx9OPOoMGtsaju06/BMT?node-id=1%3A3110&viewport=650%2C493%2C0.052038900554180145&scaling=min-zoom)
-   [Microsoft Teams group](https://teams.microsoft.com/_#/conversations/Generelt?threadId=19:bfb40c49b3e2494fa69763c4bcf642a9@thread.tacv2&ctx=channel)
