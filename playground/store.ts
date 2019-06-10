import { setIn } from "immutable";

export type IHandleChange<T> = (store: Store<T>) => void;
export type ISyncDispatcher<T> = (store: Store<T>) => T;
export type IAsyncDispatcher<T> = (store: Store<T>) => Promise<T>;
export type IDispatcher<T> =
  | null
  | { [key: string]: any }
  | ISyncDispatcher<T>
  | IAsyncDispatcher<T>;

export default class Store<T extends {} = {}> {
  constructor(
    public value: Partial<T> = {},
    public handleChange: IHandleChange<T> = () => null
  ) {}

  dispatch(value: IDispatcher<T>, callback?: (store: Store<T>) => void) {
    if (!value) {
      typeof callback === "function" && callback(this);
      return;
    }

    const previousValue = this.value;
    let nextValue = previousValue;

    const applyNewState = (next: () => void) => {
      if (typeof value === "function") {
        const syncResult = value(this);

        if (syncResult && typeof syncResult.then === "function") {
          syncResult.then((asyncResult: T | null) => {
            nextValue = asyncResult || nextValue;
            next();
          });
        } else {
          nextValue = syncResult || nextValue;
          next();
        }
      } else if (typeof value === "object" && !Array.isArray(value)) {
        nextValue = mergeStates(nextValue, value);
        next();
      } else {
        throw new TypeError(`Invalid value parameter`);
      }
    };

    const handleChange = () => {
      if (nextValue !== previousValue) {
        this.value = nextValue;
      }

      if (callback) {
        callback(this);
      }

      if (nextValue !== previousValue) {
        this.handleChange(this);
      }
    };

    applyNewState(handleChange);
  }
}

export function mergeStates<T, M extends any>(target: T, ...mergeValues: M[]) {
  return mergeValues.reduce((target1: T, mergeValue) => {
    return Object.keys(mergeValue).reduce<T>(
      (target2, key) => setIn(target2, key.split("."), mergeValue[key]),
      target1 || ({} as T)
    );
  }, target);
}

export function mergeHandlers<T extends {}>(
  ...handlers: Array<IHandleChange<T>>
) {
  return function mergedHandlers(store: Store<T>) {
    return handlers.forEach(handler => handler(store));
  };
}
