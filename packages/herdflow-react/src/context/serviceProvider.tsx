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
  createService: () => Service<D>;
};

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
      // throw new Error('oops');
      throw new Error(
        'useModule was used without a matching Provider.\nDid you forget to user the <ModuleProvider> component in the tree?',
      );
    }
    return res;
  };

  return {
    ServiceProvider,
    useService,
  };
}
