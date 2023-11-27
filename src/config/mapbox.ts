import { registerAs } from '@nestjs/config';

export default registerAs('mapbox', () => ({
  key:
    process.env.MAPBOX_ACCESS_TOKEN ||
    // 'pk.eyJ1IjoiaGlldXB0aDEyMyIsImEiOiJjbG51NzY2dXEwOWl1MnBwZXBkZnZsYmtzIn0.Kl0AW6Z5Uo10WUXnX0uLoA',
    'ppk.eyJ1IjoiZmxhdGZpdmUiLCJhIjoiY2xva2RtZ2N5MGNxNzJrczViZ29saDlnYSJ9.PoOJ0PGcLKjyfLXyHIRZBQ',
  url: process.env.MAPBOX_URL || 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
}));
