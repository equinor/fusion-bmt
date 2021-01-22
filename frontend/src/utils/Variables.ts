import { useCurrentUser } from '@equinor/fusion'

export const useAzureUniqueId = (): string => {
    const user = useCurrentUser()
    const azureUniqueId: string = user?.id as string
    return azureUniqueId
}
