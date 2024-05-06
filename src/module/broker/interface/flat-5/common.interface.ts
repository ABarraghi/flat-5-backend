export type ApiBrokers = 'coyote' | 'truck_stop' | 'dat';

export function isApiBroker(input: string): input is ApiBrokers {
  return ['coyote', 'dat', 'truck_stop'].includes(input);
}
