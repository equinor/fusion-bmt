import { useCurrentUser } from '@equinor/fusion'

export const getAzureUniqueId = (): string => {
    const user = useCurrentUser()
    const azureUniqueId: string = user?.id as string
    return azureUniqueId
}
