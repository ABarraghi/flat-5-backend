export type ApiBrokers = 'coyote' | 'truckStop' | 'dat';

export function isApiBroker(input: string): input is ApiBrokers {
  return ['coyote', 'dat', 'truckStop'].includes(input);
}
