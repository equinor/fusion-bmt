import { AppModuleInitiator } from "@equinor/fusion-framework-app"
import { enableContext } from "@equinor/fusion-framework-module-context"
import { enableNavigation } from "@equinor/fusion-framework-module-navigation"

export const configurator: AppModuleInitiator = (config) => {
    config.useFrameworkServiceClient("portal")
    enableNavigation(
        config,
        window.location.pathname.match(/^\/?apps/)
            ? "/apps/bmt"
            : "/",
    )
    enableContext(config, (builder) => {
        builder.setContextType(["ProjectMaster"])
    })
}
