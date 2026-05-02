import { targetIs } from '../utils/utils.js';
import { MARKER_SERVICE, MARKER_SERVICE_CLIENT } from './internal/symbols.js';
import type { Service } from './service.js';
import type { ServiceClient } from './types/serviceClient.js';
import type { ServiceDescriptor } from './types/types.js';

export function isService<T extends ServiceDescriptor>(obj: any): obj is Service<T> {
  return targetIs(obj, MARKER_SERVICE);
}

export function isServiceClient(obj: any): obj is ServiceClient<any> {
  return targetIs(obj, MARKER_SERVICE_CLIENT);
}
