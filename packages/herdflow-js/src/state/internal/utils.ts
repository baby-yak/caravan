import type { ReadonlyDeep } from '../types/types.js';

export function makeReadOnlyDeep<T>(x: T): ReadonlyDeep<T> {
  return x as ReadonlyDeep<T>;
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Map) && !(val instanceof Set);
}
