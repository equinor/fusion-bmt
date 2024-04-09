import { useCurrentUser } from '@equinor/fusion-framework-react-app/framework';
import { useCallback } from 'react';
import { usePeopleClient, peopleClientHeaders } from './usePeopleClient';

export const usePeopleApi = () => {
    const httpClient = usePeopleClient();
    const user = useCurrentUser();

    const getById = useCallback(async (id: string): Promise<any> => {
        return await httpClient.json(`/persons/${id}`, {
            headers: peopleClientHeaders,
        })
    }, [httpClient]);

    const search = useCallback(async (query: string): Promise<any> => {
        return await httpClient.json(`/persons?query=${query}&api-version=1.0`, {
            headers: peopleClientHeaders,
        });
    }, [httpClient])

    const getPersonRoles = useCallback(async (): Promise<any> => {
        return await httpClient.json(
            `/persons/${user?.localAccountId}?$api-version=3.0&$expand=roles`,
            {
                headers: peopleClientHeaders,
            },
        );
    }, [httpClient, user?.localAccountId]);

    return { getPersonRoles, getById, search };
};
