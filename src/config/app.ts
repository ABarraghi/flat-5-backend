import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'local',
  name: 'RaceVN',
  port: parseInt(process.env.PORT, 10) || 3000,
  isLocal(): boolean {
    const env = process.env.NODE_ENV || 'local';

    return env === 'local';
  },
  isDevelopment(): boolean {
    const env = process.env.NODE_ENV;

    return env === 'dev' || env === 'development';
  },
  seedingData: process.env.SEEDING_DATA === 'true' || false,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
}));
