import { registerAs } from '@nestjs/config';

export default registerAs('broker', () => ({
  coyote: {
    enabled: process.env.COYOTE_ENABLED !== 'false',
    host: process.env.COYOTE_HOST || 'https://api-sandbox.coyote.com',
    apiPrefix: process.env.COYOTE_API_PREFIX || 'api/v1',
    clientId: process.env.COYOTE_CLIENT_ID || 'NOERRLLC',
    clientSecret: process.env.COYOTE_CLIENT_SECRET || 'QBoz99sMGUZwZnsF',
    grantType: process.env.COYOTE_GRANT_TYPE || 'client_credentials'
  },
  dat: {
    enabled: process.env.DAT_ENABLED !== 'false',
    host: process.env.DAT_HOST || 'api.nprod.dat.com',
    identityService: process.env.DAT_IDENTITY_SERVICE || 'https://identity.',
    freightService: process.env.DAT_FREIGHT_SERVICE || 'https://freight.',
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL || 'developersupport+noerr@dat.com',
    serviceAccountPassword: process.env.SERVICE_ACCOUNT_PASSWORD || 'siE1xth3tSzG0jg'
  }
}));
