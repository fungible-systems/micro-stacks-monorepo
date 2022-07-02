import { MicroStacksClient } from '../micro-stacks-client';
import equalityFn from 'fast-deep-equal/es6/index.js';
import { State } from '../common/types';
import { getClient } from '../create-client';

export function getAccounts(client: MicroStacksClient = getClient()) {
  const { accounts } = client;
  return accounts;
}

export function watchAccounts(
  callback: (payload: State['accounts']) => void,
  client: MicroStacksClient = getClient()
) {
  const handleChange = () => callback(getAccounts());

  // unsubscribe
  return client.subscribe(({ accounts }) => accounts, handleChange, { equalityFn });
}

export function getCurrentAccount(client: MicroStacksClient = getClient()) {
  const { accounts, currentAccountIndex } = client;
  return accounts[currentAccountIndex] ?? { appPrivateKey: null, address: null };
}

export function getStxAddress(client: MicroStacksClient = getClient()) {
  const { stxAddress } = client;
  return stxAddress ?? null;
}

export function watchStxAddress(
  callback: (payload: MicroStacksClient['stxAddress']) => void,
  client: MicroStacksClient = getClient()
) {
  const handleChange = () => callback(getStxAddress());

  // unsubscribe
  return client.subscribe(
    () => {
      return client.stxAddress;
    },
    handleChange,
    { equalityFn }
  );
}

export function watchCurrentAccount(
  callback: (payload: MicroStacksClient['accounts'][number]) => void,
  client: MicroStacksClient = getClient()
) {
  const handleChange = () => callback(getCurrentAccount(client));

  // unsubscribe
  return client.subscribe(
    ({ accounts, currentAccountIndex }) => {
      return accounts[currentAccountIndex] ?? { appPrivateKey: null, address: null };
    },
    handleChange,
    { equalityFn }
  );
}
