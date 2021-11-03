type Unsubscribe = () => void;

type AsyncStorage<Value> = {
  getItem: (key: string) => Promise<Value>;
  setItem: (key: string, newValue: Value) => Promise<void>;
  delayInit?: boolean;
  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
};

type SyncStorage<Value> = {
  getItem: (key: string) => Value;
  setItem: (key: string, newValue: Value) => void;
  delayInit?: boolean;
  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
};

type AsyncStringStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, newValue: string) => Promise<void>;
};

type SyncStringStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, newValue: string) => void;
};

export function createJSONStorage<Value>(
  getStringStorage: () => AsyncStringStorage,
  serialize: (val: Value) => string,
  deserialize: (str: string) => Value
): AsyncStorage<Value>;

export function createJSONStorage<Value>(
  getStringStorage: () => SyncStringStorage,
  serialize: (val: Value) => string,
  deserialize: (str: string) => Value
): SyncStorage<Value>;
export function createJSONStorage<Value>(
  getStringStorage: () => AsyncStringStorage | SyncStringStorage,
  serialize: (val: Value) => string = JSON.stringify,
  deserialize: (str: string) => Value = JSON.parse
): AsyncStorage<Value> | SyncStorage<Value> {
  return {
    getItem: key => {
      const value = getStringStorage().getItem(key);
      if (value instanceof Promise) {
        return value.then(v => deserialize(v || '')) as unknown as Value;
      }
      return deserialize(value || '') as Value;
    },
    setItem: (key, newValue) => {
      getStringStorage().setItem(key, serialize(newValue));
    },
  };
}
