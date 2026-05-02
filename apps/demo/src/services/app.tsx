import { createModule } from '@baby-yak/herdflow-js';
import { CounterService, type ICounter } from './courerService';
import { UsersService, type IUsers } from './userService';

export type AppDesc = {
  counter: ICounter;
  users: IUsers;
};
export const app = createModule<AppDesc>(
  {
    counter: new CounterService(),
    users: new UsersService(),
  },
  { verbose: true },
);

export const module = app.client;
export const services = app.services;
