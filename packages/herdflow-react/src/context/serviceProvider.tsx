import {
  createModule,
  type Module,
  type ModuleConstructionParams,
  type Service,
  type ServiceClient,
  type ServiceDescriptor,
} from '@baby-yak/herdflow-js';
import { createContext, useContext, useEffect, useRef } from 'react';

export type ServiceProviderProps<D extends ServiceDescriptor> = {
  children?: React.ReactNode;
  /** Factory called once on mount to create the service instance. */
  createService: () => Service<D>;
};

/**
 * Creates a scoped React context for a single service — returns a typed `ServiceProvider` and `useService` pair.
 *
 * Call once per service type (typically at the module level). The returned `ServiceProvider`
 * accepts a `createService` prop that is called once on mount to instantiate the service.
 * The service lifecycle (`start` / `stop`) is managed automatically.
 *
 * @param params optional module construction params (e.g. `verbose`)
 *
 * @example
 * const { ServiceProvider, useService } = createServiceContext<ICounter>();
 *
 * // provide:
 * <ServiceProvider createService={() => new CounterService()}>
 *   <CounterView />
 * </ServiceProvider>
 *
 * // consume anywhere in the tree:
 * const counter = useService();
 * counter.actions.increment();
 */
export function createServiceContext<D extends ServiceDescriptor>(
  params?: ModuleConstructionParams,
) {
  const context = createContext<ServiceClient<D> | null>(null);

  //provider component
  const ServiceProvider = ({ createService, children }: ServiceProviderProps<D>) => {
    const moduleRef = useRef<Module<{ theService: Service<D> }>>();

    if (moduleRef.current == null) {
      // lazy create once
      const service = createService();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      moduleRef.current = createModule({ theService: service }, params);
    }

    //start - stop
    useEffect(() => {
      moduleRef.current?.start().catch(console.error);
      return () => {
        moduleRef.current?.stop().catch(console.error);
      };
    }, []);

    //the provider
    return (
      <context.Provider value={moduleRef.current.services.theService}>{children}</context.Provider>
    );
  };

  const useService = (): ServiceClient<D> => {
    const res = useContext(context) as ServiceClient<D> | undefined;

    if (res == null) {
      throw new Error(
        'useService was used without a matching Provider.\nDid you forget to use the <ServiceProvider> component in the tree?',
      );
    }
    return res;
  };

  return {
    ServiceProvider,
    useService,
  };
}
