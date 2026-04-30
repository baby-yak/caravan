import type { Service } from '../service.js';
import type { ServiceDescriptor } from './types.js';

/**
 * A service created via `createService()` — supports direct lifecycle callback assignment
 * as an alternative to overriding lifecycle methods in a subclass.
 *
 * All lifecycle properties are optional. Unassigned phases are no-ops.
 *
 * @example
 * const server = createService<IServer>('server', { address: '' });
 * server.onInit  = async () => { await db.connect(); };
 * server.onStart = () => { server.actions.connect(8080); };
 * server.onStop  = () => { server.actions.disconnect(); };
 */
export interface ComposableService<
  Descriptor extends ServiceDescriptor,
> extends Service<Descriptor> {
  //-------------------------------------------------------
  //-- Lifecycle Hooks Callbacks
  //-------------------------------------------------------

  /** Called first during `module.start()`. Use for standalone setup (DB connect, config load, etc.). */
  onInit?: () => void | Promise<void>;

  /** Called after all services have initialized. Safe for cross-service wiring — listeners, state reads, action calls. */
  onStart?: () => void | Promise<void>;

  /** Called after all services have started. Use for final setup that depends on all services being fully running. */
  onAfterStart?: () => void | Promise<void>;

  /** Called first during `module.stop()`, while all services are still live. Use for cross-service ops before teardown. */
  onBeforeStop?: () => void | Promise<void>;

  /** Called after all services have completed `onBeforeStop`. Use for standalone teardown — close connections, unregister listeners. */
  onStop?: () => void | Promise<void>;
}
