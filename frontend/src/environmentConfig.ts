export const resolveConfiguration = (env: string) => {
    switch (env) {
        case "FPRD":
            return {
                REACT_APP_API_BASE_URL: "https://backend-acr-fusion-bmt-prod.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "PRD":
            return {
                REACT_APP_API_BASE_URL: "https://backend-acr-fusion-bmt-prod.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "FQA":
            return {
                REACT_APP_API_BASE_URL: "https://backend-acr-fusion-bmt-qa.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "QA":
            return {
                REACT_APP_API_BASE_URL: "https://backend-acr-fusion-bmt-qa.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "CI":
            return {
                REACT_APP_API_BASE_URL: "https://backend-acr-fusion-bmt-dev.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "PR":
            return {
                REACT_APP_API_BASE_URL: "https://backend-fusion-bmt-pr.radix.equinor.com",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        case "dev":
            return {
                REACT_APP_API_BASE_URL: "http://localhost:5000",
                BACKEND_APP_SCOPE: ["api://8829d4ca-93e8-499a-8ce1-bc0ef4840176/user_impersonation"],
                APP_ID: "8829d4ca-93e8-499a-8ce1-bc0ef4840176",
            }
        default:
            throw new Error(`Unknown env '${env}'`)
    }
}
