import { createModuleContext, useReactiveState } from '@baby-yak/herdflow-react';
import classNames from 'classnames';
import { CounterService, type ICounter } from '../services/courerService';
import styles from './subTree.module.css';

type M = {
  counter: ICounter;
};

const TAG = 'subTree';
type Props = {};

//
const { ModuleProvider, useModule } = createModuleContext<M>({ verbose: true });
function create() {
  console.log('creating module');
  return {
    counter: new CounterService(),
  };
}

export default function SubTree({}: Props) {
  return (
    <div data-component={TAG} className={classNames(styles.root)}>
      <ModuleProvider createModule={create}>
        <Inner1 />
        <Inner2 />
      </ModuleProvider>
    </div>
  );
}

//-------------------------------------------------------
type Inner1Props = {};
function Inner1({}: Inner1Props) {
  const services = useModule();
  return (
    <div className={classNames(styles.Inner)}>
      <button onClick={() => services.counter.actions.increment()}>+</button>
    </div>
  );
}

//-------------------------------------------------------
type Inner2Props = {};
function Inner2({}: Inner2Props) {
  const services = useModule();
  const state = useReactiveState(services.counter, (s) => s.count);
  return <div className={classNames(styles.Inner)}>inner count = {state}</div>;
}
