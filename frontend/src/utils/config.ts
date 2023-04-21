export const ResolveConfiguration = (env: string) => {
    switch (env) {
        case "FPRD":
            return {
                API_URL: "https://backend-acr-fusion-bmt-prod.radix.equinor.com",
            }
        case "FQA":
            return {
                API_URL: "https://backend-acr-fusion-bmt-qa.radix.equinor.com",
            }
        case "CI":
            return {
                API_URL: "https://backend-acr-fusion-bmt-dev.radix.equinor.com",
            }
        case "PR":
            return {
                API_URL: "https://backend-acr-fusion-bmt-dev.radix.equinor.com",
            }
        case "dev":
            return {
                API_URL: "http://localhost:5000",
            }
        default:
            throw new Error(`Unknown env '${env}'`)
    }
}