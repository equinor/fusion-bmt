import { useCallback } from 'react';
import { useContextClient, projectClientHeaders } from './useContextClient';

export const useContextApi = () => {
    const httpClient = useContextClient();

    const getById = useCallback(async (id: string): Promise<any> => {
        return await httpClient.json(`/contexts/${id}?api-version=1.0`, {
            headers: projectClientHeaders,
        })
    }, [httpClient]);

    return { getById };
};
