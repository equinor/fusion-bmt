/* eslint-disable no-restricted-globals */
const getEnv = (): string => {
    const isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1"

    if (isLocalHost) {
        return "dev"
    }

    switch (location.hostname) {
    case "fusion-s-portal-fqa.azurewebsites.net":
        return "QA"

    case "fusion-s-portal-ci.azurewebsites.net":
        return "CI"

    case "fusion.equinor.com":
    case "fusion-s-portal-fprd.azurewebsites.net":
        return "FPRD"

    default:
        return "dev"
    }
}

export const EnvironmentVariables = {
    ENVIRONMENT: getEnv(),
}
