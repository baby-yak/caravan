import { createModule } from '@baby-yak/herdflow-js';
import { CounterService, type ICounter } from './courerService';
import { UsersService, type IUsers } from './userService';

export type App = {
  counter: ICounter;
  users: IUsers;
};
export const app = createModule<App>(
  {
    counter: new CounterService(),
    users: new UsersService(),
  },
  { verbose: true },
);

export const module = app.createClient();
export const services = app.services;
