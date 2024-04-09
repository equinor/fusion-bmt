import { useCurrentUser } from '@equinor/fusion-framework-react-app/framework';
import { useCallback } from 'react';
import { useProjectClient, projectClientHeaders } from './useProjectClient';

export const useProjectApi = () => {
    const httpClient = useProjectClient();
    const user = useCurrentUser();

    const getById = useCallback(async (id: string): Promise<any> => {
        return await httpClient.json(`/projects/${id}`, {
            headers: projectClientHeaders,
        })
    }, [httpClient]);

    return { getById };
};
