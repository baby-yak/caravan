import { Service } from '@baby-yak/herdflow-js';
import { delay } from '../utils';

export type User = {
  id: string;
  name: string;
};

export type IUsers = {
  state: {
    users: User[];
  };
  events: {
    //no
  };
  actions: {
    add(name: string): Promise<string>;
    fetch(id: string): Promise<User>;
  };
};

export class UsersService extends Service<IUsers> {
  constructor() {
    super('users', { users: [] });
    this.actions.setHandler(this);
  }

  async add(name: string) {
    await delay(1000);
    const id = (Math.random() * 1000_000).toFixed();
    this.state.update((s) =>
      s.users.push({
        id,
        name,
      }),
    );
    return id;
  }
  async fetch(id: string) {
    await delay(1000);
    const { users } = this.state.get();
    const user = users.find((x) => x.id === id);
    if (!user) {
      throw new Error('no user');
    }

    return user;
  }
}
