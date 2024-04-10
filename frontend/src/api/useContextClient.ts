import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

import type { IHttpClient } from '@equinor/fusion-framework-react-app/http';

export const useContextClient = (): IHttpClient => {
    const client = useHttpClient('context');
    return client;
};

export const projectClientHeaders: HeadersInit = {
    'api-version': '3.0',
    'Cache-Control': 'no-cache',
};
