import { handleApi } from '../../server/api.mjs';
import { openStore } from '../../server/store.mjs';

const env = key => globalThis.Netlify?.env?.get?.(key) || process.env[key] || '';

export default async request => handleApi(request, {
  store: await openStore(),
  env: {
    ADMIN_USERNAME: env('ADMIN_USERNAME'),
    ADMIN_PASSWORD: env('ADMIN_PASSWORD'),
    AUTH_SECRET: env('AUTH_SECRET'),
  },
});

export const config = { path: '/api/*' };
