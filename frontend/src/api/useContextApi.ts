import { useCallback } from 'react';
import { useContextClient, projectClientHeaders } from './useContextClient';
import { Context } from '@equinor/fusion/lib/http/apiClients/models/bookmarks/BookmarkResponse';

export const useContextApi = () => {
    const httpClient = useContextClient();

    const getById = useCallback(async (id: string): Promise<any> => {
        return await httpClient.json(`/contexts/${id}?api-version=1.0`, {
            headers: projectClientHeaders,
        })
    }, [httpClient]);

    const getAll = useCallback(async (): Promise<Context[]> => {
        return await httpClient.json(`/contexts?includeDeleted=false&%24filter=type%20%3D%3D%20%27ProjectMaster%27&api-version=1.0`, {
            headers: projectClientHeaders,
        })
    }, [httpClient]);

    return { getById, getAll };
};
