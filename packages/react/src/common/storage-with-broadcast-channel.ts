import { atom, Getter } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { BroadcastChannel } from 'broadcast-channel';
import { createJSONStorage } from './create-json-storage';

type GetInitialValue<Value> = (get: Getter) => Value;

interface OnMessageAction {
  event: string;
  payload: { value: string; key: string };
}

export function atomWithStorageBroadcastChannel<Value>(
  key: string,
  initialValue: Value | GetInitialValue<Value>,
  serialize: (val: Value) => string = JSON.stringify,
  deserialize: (str: string) => Value = JSON.parse
) {
  const channel = new BroadcastChannel<OnMessageAction>(`micro_stacks_broadcast_channel_${key}`, {
    webWorkerSupport: false,
  });
  const getInitialValue = (get: Getter) =>
    typeof initialValue === 'function'
      ? (initialValue as GetInitialValue<Value>)(get)
      : initialValue;

  const storageAtom = atom(get => {
    return atomWithStorage<Value>(key, getInitialValue(get), {
      ...createJSONStorage(
        () => ({
          getItem: (key: string) => {
            return localStorage.getItem(key);
          },
          setItem: async (key: string, value: string) => {
            localStorage.setItem(key, value);
            await channel.postMessage({
              event: 'setItem',
              payload: {
                key,
                value,
              },
            });
          },
        }),
        serialize,
        deserialize
      ),
      subscribe(key, setAtom) {
        const onMessage = (action: OnMessageAction) => {
          if (action?.event === 'setItem' && action?.payload?.key === key) {
            setAtom(deserialize(action.payload.value || ''));
          }
        };
        channel.addEventListener('message', onMessage);
        return () => {
          channel.removeEventListener('message', onMessage);
        };
      },
    });
  });
  return atom<Value, Value>(
    get => {
      const anAtom = get(storageAtom);
      return get(anAtom);
    },
    (get, set, update) => {
      const anAtom = get(storageAtom);
      set(anAtom, update);
    }
  );
}
