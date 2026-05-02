import { describe, expect, it } from 'vitest';
import { ActionExecuter } from '../actions/actionExecuter.js';
import {
  isActionClient,
  isActionExecuter,
  isEventClient,
  isEventEmitter,
  isModule,
  isModuleClient,
  isReactiveState,
  isService,
  isServiceClient,
  isStateClient,
} from '../core/helpers.js';
import { EventEmitter } from '../events/eventEmitter.js';
import { createModule } from '../modules/moduleFactory.js';
import { Service } from '../services/service.js';
import { ReactiveState } from '../state/reactiveState.js';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

type ICounter = {
  state: { count: number };
  events: { changed: () => void };
  actions: { increment(): void };
};

class CounterService extends Service<ICounter> {
  constructor() {
    super('counter', { count: 0 });
  }
}

const NOT_INSTANCES = [null, undefined, {}, [], 42, 'string', true];

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// isActionExecuter / isActionClient
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('isActionExecuter', () => {
  it('returns true for ActionExecuter', () => {
    expect(isActionExecuter(new ActionExecuter())).toBe(true);
  });

  it('returns true for ActionExecuter.client (no — client is ActionClient_imp)', () => {
    expect(isActionExecuter(new ActionExecuter().client)).toBe(false);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isActionExecuter(v)).toBe(false);
  });
});

describe('isActionClient', () => {
  it('returns true for ActionExecuter (it IS an ActionClient)', () => {
    expect(isActionClient(new ActionExecuter())).toBe(true);
  });

  it('returns true for ActionExecuter.client', () => {
    expect(isActionClient(new ActionExecuter().client)).toBe(true);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isActionClient(v)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// isEventEmitter / isEventClient
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('isEventEmitter', () => {
  it('returns true for EventEmitter', () => {
    expect(isEventEmitter(new EventEmitter())).toBe(true);
  });

  it('returns false for EventEmitter.client (EventClient_imp)', () => {
    expect(isEventEmitter(new EventEmitter().client)).toBe(false);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isEventEmitter(v)).toBe(false);
  });
});

describe('isEventClient', () => {
  it('returns true for EventEmitter (it IS an EventClient)', () => {
    expect(isEventClient(new EventEmitter())).toBe(true);
  });

  it('returns true for EventEmitter.client', () => {
    expect(isEventClient(new EventEmitter().client)).toBe(true);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isEventClient(v)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// isReactiveState / isStateClient
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('isReactiveState', () => {
  it('returns true for ReactiveState', () => {
    expect(isReactiveState(new ReactiveState(0))).toBe(true);
  });

  it('returns false for ReactiveState.client (StateClient_imp)', () => {
    expect(isReactiveState(new ReactiveState(0).client)).toBe(false);
  });

  it('returns false for ReactiveState.select() (StateSelector_imp)', () => {
    expect(isReactiveState(new ReactiveState({ n: 0 }).select((s) => s.n))).toBe(false);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isReactiveState(v)).toBe(false);
  });
});

describe('isStateClient', () => {
  it('returns true for ReactiveState (it IS a StateClient)', () => {
    expect(isStateClient(new ReactiveState(0))).toBe(true);
  });

  it('returns true for ReactiveState.client', () => {
    expect(isStateClient(new ReactiveState(0).client)).toBe(true);
  });

  it('returns true for ReactiveState.select()', () => {
    expect(isStateClient(new ReactiveState({ n: 0 }).select((s) => s.n))).toBe(true);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isStateClient(v)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// isService / isServiceClient
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('isService', () => {
  it('returns true for a Service subclass', () => {
    expect(isService(new CounterService())).toBe(true);
  });

  it('returns false for a ServiceClient_imp (service.client)', () => {
    expect(isService(new CounterService().client)).toBe(false);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isService(v)).toBe(false);
  });
});

describe('isServiceClient', () => {
  it('returns true for a Service (it IS a ServiceClient)', () => {
    expect(isServiceClient(new CounterService())).toBe(true);
  });

  it('returns true for service.client', () => {
    expect(isServiceClient(new CounterService().client)).toBe(true);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isServiceClient(v)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// isModule / isModuleClient
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

describe('isModule', () => {
  it('returns true for a Module_Imp', () => {
    const app = createModule({ s: new CounterService() });
    expect(isModule(app)).toBe(true);
  });

  it('returns false for module.client (ModuleClient_imp)', () => {
    const app = createModule({ s: new CounterService() });
    expect(isModule(app.client)).toBe(false);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isModule(v)).toBe(false);
  });
});

describe('isModuleClient', () => {
  it('returns true for a Module_Imp (it IS a ModuleClient)', () => {
    const app = createModule({ s: new CounterService() });
    expect(isModuleClient(app)).toBe(true);
  });

  it('returns true for module.client', () => {
    const app = createModule({ s: new CounterService() });
    expect(isModuleClient(app.client)).toBe(true);
  });

  it.each(NOT_INSTANCES)('returns false for %o', (v) => {
    expect(isModuleClient(v)).toBe(false);
  });
});
