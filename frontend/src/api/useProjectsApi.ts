import { useCurrentUser } from '@equinor/fusion-framework-react-app/framework';
import { useCallback } from 'react';
import { useProjectsClient, projectClientHeaders } from './useProjectsClient';

export const useProjectsApi = () => {
    const httpClient = useProjectsClient();
    const user = useCurrentUser();

    const getById = useCallback(async (id: string): Promise<any> => {
        return await httpClient.json(`/projects/${id}?api-version=1.0`, {
            headers: projectClientHeaders,
        })
    }, [httpClient]);

    return { getById };
};
