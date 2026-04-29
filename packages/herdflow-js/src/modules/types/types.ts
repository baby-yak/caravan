import type { Service } from '../../services/service.js';

export type ModuleDescriptor = {
  [key: string]: Service<any>;
};
export type ModuleConstructionParams = {
  verbose?: boolean;
};
