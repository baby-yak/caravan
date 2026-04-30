import classNames from "classnames";
import styles from "./Counter.module.css";

const TAG="Counter"
type Props = {
};

export default function Counter({}: Props) {
  return <div data-component={TAG} className={classNames(styles.root)}>
    Counter
  </div>;
}
