import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const usePeopleClient = (): IHttpClient => {
    const client = useHttpClient('people');
    return client;
};

export const peopleClientHeaders: HeadersInit = {
    'api-version': '3.0',
    'Cache-Control': 'no-cache',
};
