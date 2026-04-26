import type { ServiceActionsDefinitions } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createClient<T extends ServiceActionsDefinitions>(
  dispatcher: (name: keyof T, ...args: any[]) => any,
): T {
  const client = {} as T;

  const proxy = new Proxy(client, {
    get(_target, prop) {
      return (...args: any[]) => dispatcher(prop, ...(args as unknown[])) as unknown;
    },
  });

  return proxy;
}
