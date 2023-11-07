export type ApiBrokers = 'coyote' | 'dat';

export function isApiBroker(input: string): input is ApiBrokers {
  return ['coyote', 'dat'].includes(input);
}
