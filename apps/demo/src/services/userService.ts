import { Service } from '@baby-yak/herdflow-js';
import { delay } from '../utils';
import { v4 as uuid } from 'uuid';

export type User = {
  id: string;
  name: string;
};

export type IUsers = {
  state: {
    users: User[];
  };
  // events: {
  //   //no
  // };
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

  protected async onServiceInit() {
    await delay(1000);
  }

  async add(name: string) {
    await delay(1000);
    if (name.trim() === '') {
      throw new Error('nope');
    }
    const id = uuid();
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
