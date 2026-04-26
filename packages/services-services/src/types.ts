export type ServiceAction = ((...args: any) => any) | ((...args: any) => Promise<any>);
export type ServiceActionsDefinitions = Record<string | symbol, ServiceAction>;

export type ServiceDefinitions = {
  state: object;
  actions: ServiceActionsDefinitions;
  events: object;
};
