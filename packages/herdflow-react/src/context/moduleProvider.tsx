import {
  createModule,
  type Module,
  type ModuleConstructionParams,
  type ModuleDescriptor,
  type ModuleServiceClients,
  type ServiceImplementors,
} from '@baby-yak/herdflow-js';
import { createContext, useContext, useEffect, useRef } from 'react';

export type ModuleProviderProps<M extends ModuleDescriptor> = {
  children?: React.ReactNode;
  createModule: () => ServiceImplementors<M>;
};

export function createModuleContext<M extends ModuleDescriptor>(params?: ModuleConstructionParams) {
  const context = createContext<Module<any> | null>(null);

  //provider component
  const ModuleProvider = (props: ModuleProviderProps<M>) => {
    const moduleRef = useRef<Module<M>>();
    if (moduleRef.current == null) {
      // lazy create once
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      moduleRef.current = createModule(props.createModule(), params);
    }

    //start - stop
    useEffect(() => {
      moduleRef.current?.start().catch(console.error);
      return () => {
        moduleRef.current?.stop().catch(console.error);
      };
    }, []);

    //the provider
    return <context.Provider value={moduleRef.current}>{props.children}</context.Provider>;
  };

  const useModule = (): ModuleServiceClients<M> => {
    const res = useContext(context) as Module<M> | undefined;

    if (res == null) {
      // throw new Error('oops');
      throw new Error(
        'useModule was used without a matching Provider.\nDid you forget to user the <ModuleProvider> component in the tree?',
      );
    }
    return res.services;
  };

  return {
    ModuleProvider,
    useModule,
  };
}

//-------------------------------------------------------
//-------------------------------------------------------
//-------------------------------------------------------
