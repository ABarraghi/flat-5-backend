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
  },
  truck_stop: {
    enabled: process.env.TRUCK_STOP_ENABLED || true,
    urlWebServices:
      process.env.TRUCK_STOP_URL_WEB_SERVICES ||
      'http://testws.truckstop.com:8080/V13/Searching/LoadSearch.svc',
    urlSoapAction:
      process.env.TRUCK_STOP_URL_SOAP_ACTION || 'http://webservices.truckstop.com/v12/ILoadSearch',
    email: process.env.TRUCK_STOP_EMAIL || 'scott@noerr-inc.com',
    userName: process.env.TRUCK_STOP_USERNAME || 'NoerrWS',
    // password: process.env.TRUCK_STOP_PASSWORD || 'Developer234!',
    password: process.env.TRUCK_STOP_PASSWORD || '40s6eAVZDk1f',
    integrationId: process.env.TRUCK_STOP_INTEGRATION_ID || 610571
  }
}));
