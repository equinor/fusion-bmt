import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useProjectClient = (): IHttpClient => {
    const client = useHttpClient('people');
    return client;
};

export const projectClientHeaders: HeadersInit = {
    'api-version': '3.0',
    'Cache-Control': 'no-cache',
};
