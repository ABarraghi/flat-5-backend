import { registerAs } from '@nestjs/config';

export default registerAs('broker', () => ({
  coyote: {
    enabled: process.env.COYOTE_ENABLED || true,
    host: process.env.COYOTE_HOST || 'https://api-sandbox.coyote.com',
    apiPrefix: process.env.COYOTE_API_PREFIX || 'api/v1',
    clientId: process.env.COYOTE_CLIENT_ID || 'NOERRLLC',
    clientSecret: process.env.COYOTE_CLIENT_SECRET || 'QBoz99sMGUZwZnsF',
    grantType: process.env.COYOTE_GRANT_TYPE || 'client_credentials'
  }
}));
