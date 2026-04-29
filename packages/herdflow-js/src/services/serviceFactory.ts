import { ComposableService_imp } from './internal/composableService_imp.js';
import type { ComposableService } from './types/composableService.js';
import type { DescState, ServiceConstructionParams, ServiceDescriptor } from './types/types.js';

export function createService<Descriptor extends ServiceDescriptor = ServiceDescriptor>(
  name: string,
  initialState: DescState<Descriptor>,
  params?: ServiceConstructionParams,
): ComposableService<Descriptor> {
  return new ComposableService_imp<Descriptor>(name, initialState, params);
}
