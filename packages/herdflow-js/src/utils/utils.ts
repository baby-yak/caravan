export function delay(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function delayResolve<T = any>(timeout: number, result: T) {
  return new Promise<T>((resolve) =>
    setTimeout(() => {
      resolve(result);
    }, timeout),
  );
}

export function delayReject<T = any>(timeout: number, error: Error) {
  return new Promise<T>((resolve, reject) =>
    setTimeout(() => {
      reject(error);
    }, timeout),
  );
}
