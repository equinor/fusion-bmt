import { AppModuleInitiator } from "@equinor/fusion-framework-app"
import { enableNavigation } from "@equinor/fusion-framework-module-navigation"
import { enableContext } from "@equinor/fusion-framework-module-context"

export const configure: AppModuleInitiator = (configurator, args) => {
    const { basename } = args.env
    console.log("Configuring app with basename", basename)

    configurator.useFrameworkServiceClient("portal")

    enableNavigation(configurator, basename)

    enableContext(configurator, (builder) => {
        builder.setContextType(["ProjectMaster"])
    })
}

export default configure
