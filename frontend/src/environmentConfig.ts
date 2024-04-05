export const resolveConfiguration = (env: string) => {
    switch (env) {
    case "FPRD":
        return {
            REACT_APP_API_BASE_URL:
                    "https://backend-dcd-prod.radix.equinor.com",
            BACKEND_APP_SCOPE: [
                "api://81bd7b7f-4096-4c4f-b0c2-ebef7d05c0e6/ConceptApp.CreateEditProjects",
            ],
            APP_ID: "81bd7b7f-4096-4c4f-b0c2-ebef7d05c0e6",
        }
    case "FQA":
        return {
            REACT_APP_API_BASE_URL:
                    "https://backend-dcd-qa.radix.equinor.com",
            BACKEND_APP_SCOPE: [
                "api://151950a5-f886-47cd-b361-afb81e75c345/Project.ReadWrite",
            ],
            APP_ID: "9b125a0c-4907-43b9-8db2-ff405d6b0524",
        }
    case "CI":
        return {
            REACT_APP_API_BASE_URL:
                    "https://backend-dcd-dev.radix.equinor.com",
            BACKEND_APP_SCOPE: [
                "api://151950a5-f886-47cd-b361-afb81e75c345/Project.ReadWrite",
            ],
            APP_ID: "9b125a0c-4907-43b9-8db2-ff405d6b0524",
        }
    case "PR":
        return {
            REACT_APP_API_BASE_URL:
                    "https://backend-dcd-dev.radix.equinor.com",
            BACKEND_APP_SCOPE: [
                "api://151950a5-f886-47cd-b361-afb81e75c345/Project.ReadWrite",
            ],
            APP_ID: "9b125a0c-4907-43b9-8db2-ff405d6b0524",
        }
    case "dev":
        return {
            REACT_APP_API_BASE_URL: "http://localhost:5000",
            BACKEND_APP_SCOPE: [
                "api://151950a5-f886-47cd-b361-afb81e75c345/Project.ReadWrite",
            ],
            APP_ID: "9b125a0c-4907-43b9-8db2-ff405d6b0524",
        }
    default:
        throw new Error(`Unknown env '${env}'`)
    }
}
