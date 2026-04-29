import type { Service } from '../service.js';
import type { ServiceDescriptor } from './types.js';

export interface ComposableService<
  Descriptor extends ServiceDescriptor,
> extends Service<Descriptor> {
  //-------------------------------------------------------
  //-- Hookable lifecycle callbacks
  //-------------------------------------------------------

  onInit?: () => void | Promise<void>;
  onStart?: () => void | Promise<void>;
  onAfterStart?: () => void | Promise<void>;
  onBeforeStop?: () => void | Promise<void>;
  onStop?: () => void | Promise<void>;
}
