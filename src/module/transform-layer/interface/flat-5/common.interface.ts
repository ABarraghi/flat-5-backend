export type ApiBrokers = 'coyote';

export function isApiBroker(input: string): input is ApiBrokers {
  return input === 'coyote';
}
