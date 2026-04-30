import classNames from 'classnames';
import styles from './App.module.css';
import Counter from './components/counter';
import Users from './components/users';

function App() {
  return (
    <div className={classNames(styles.root)}>
      <Counter />
      <Users />
    </div>
  );
}

export default App;
