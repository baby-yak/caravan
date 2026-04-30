import { createModule } from '@baby-yak/herdflow-js';
import { CounterService, type ICounter } from './courerService';
import { UsersService, type IUsers } from './userService';

export type App = {
  counter: ICounter;
  users: IUsers;
};
export const app = createModule<App>({
  counter: new CounterService(),
  users: new UsersService(),
});

export const services = app.services;
