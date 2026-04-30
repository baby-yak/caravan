import { Module_Imp } from './internal/module_imp.js';
import type { Module } from './types/module.js';
import type {
  ConcreteModuleDescriptor,
  ModuleConstructionParams,
  ModuleDescriptor,
  ServiceImplementors,
} from './types/types.js';

//-------------------------------------------------------
// two overloads for creating a module - explicit and implicit module descriptor
//-------------------------------------------------------

/**
 * create a module without module descriptor type param. the shape will be inferred from the services provided\
 * @example
 * const app = createModule({
 *  server : new ServerService(),
 *  db : new DatabaseService(),
 * })
 *
 * @param services name->Service
 * @param params optional construction params
 */
export function createModule<T_Module extends ConcreteModuleDescriptor>(
  services: T_Module,
  params?: ModuleConstructionParams,
): Module<T_Module>;

/**
 * create a module with module descriptor type param. the shape will be enforced
 * @example
 * type App = {
 *    server : Service<IServer>, // Service with service descriptor
 *    db : IDatabase,            // shorthand - can also just specify the service descriptor
 * }
 * const app = createModule<App>({
 *  server : new ServerService(),
 *  db : new DatabaseService(),
 * })
 *
 * @param services name->Service
 * @param params optional construction params
 */

export function createModule<T_Module extends ModuleDescriptor>(
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  services: ServiceImplementors<T_Module>,
  params?: ModuleConstructionParams,
): Module<T_Module>;

//-------------------------------------------------------
// Implementation (not visible to users)
//-------------------------------------------------------
export function createModule(
  services: ConcreteModuleDescriptor,
  params?: ModuleConstructionParams,
): Module<any> {
  return new Module_Imp(services, params);
}
