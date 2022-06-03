type BaseStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const DEFAULT_PREFIX = 'micro-stacks';

export type ClientStorage<V = unknown> = {
  getItem: <Value = V>(key: string, defaultValue?: Value | null) => Value | null;
  setItem: <Value>(key: string, value: Value | null) => void;
  removeItem: (key: string) => void;
};

export const noopStorage: BaseStorage = {
  getItem: _key => null,
  setItem: (_key, _value) => {},
  removeItem: _key => {},
};

export const defaultStorage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
});

export function createStorage<V = unknown>({
  storage,
  key: prefix = DEFAULT_PREFIX,
}: {
  storage: BaseStorage;
  key?: string;
}): ClientStorage<V> {
  return {
    ...storage,
    getItem: (key, defaultState = null) => {
      const value = storage.getItem(`${prefix}.${key}`);
      try {
        return value ? JSON.parse(value) : defaultState;
      } catch (error) {
        console.warn(error);
        return defaultState;
      }
    },
    setItem: (key, value) => {
      if (value === null) {
        storage.removeItem(`${prefix}.${key}`);
      } else {
        try {
          storage.setItem(`${prefix}.${key}`, JSON.stringify(value));
        } catch (err) {
          console.error(err);
        }
      }
    },
    removeItem: key => storage.removeItem(`${prefix}.${key}`),
  };
}
