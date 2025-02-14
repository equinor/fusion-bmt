/* eslint-disable no-restricted-globals */
const getEnv = (): string => {
    const isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1"

    if (isLocalHost) {
        return "dev"
    }

    switch (location.hostname) {
    case "fusion.fqa.fusion-dev.net":
        return "QA"

    case "fusion.ci.fusion-dev.net":
        return "CI"

    case "fusion.equinor.com":
        return "FPRD"

    default:
        return "dev"
    }
}

export const EnvironmentVariables = {
    ENVIRONMENT: getEnv(),
}
