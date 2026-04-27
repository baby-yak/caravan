export type ListenersErrorHandlingType<T_Custom extends (...args: any) => void> =
  | 'ignore'
  | 'log'
  | 'warn'
  | 'error'
  | 'throw'
  | T_Custom;

/** Call to stop receiving state updates from a subscription. */
export type UnsubscribeFn = () => void;
