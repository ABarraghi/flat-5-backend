export type ApiBrokers = 'coyote' | 'truck_stop';

export function isApiBroker(input: string): input is ApiBrokers {
  return ['coyote', 'truck_stop'].includes(input);
}
