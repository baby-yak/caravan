import type { ModuleClient } from '@baby-yak/herdflow-js';
import { useReactiveState } from '@baby-yak/herdflow-react';
import classNames from 'classnames';
import styles from './moduleView.module.css';

const TAG = 'moduleView';
type Props = {module:ModuleClient};

export default function ModuleView({module}: Props) {
  const isStarted = useReactiveState(module.state, (s) => s.isStarted);
  return (
    <div data-component={TAG} className={classNames(styles.root)}>
      <div className={classNames(styles.indicator)} data-is-started={isStarted}></div>

      <div className={classNames(styles.title)}>module</div>
    </div>
  );
}
