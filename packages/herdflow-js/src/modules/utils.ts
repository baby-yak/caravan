import { targetIs } from '../utils/utils.js';
import { MARKER_MODULE, MARKER_MODULE_CLIENT } from './internal/symbols.js';
import type { Module, ModuleClient } from './types/types.js';

export function isModule(obj: any): obj is Module<any> {
  return targetIs(obj, MARKER_MODULE);
}

export function isModuleClient(obj: any): obj is ModuleClient<any> {
  return targetIs(obj, MARKER_MODULE_CLIENT);
}
