import { MicroStacksClient } from '../client/micro-stacks-client';
import equalityFn from 'fast-deep-equal/es6';
import { State } from '../common/types';
import { getClient } from '../client/create-client';

export function getAccounts() {
  const { accounts } = getClient();
  return accounts;
}

export function watchAccounts(callback: (payload: State['accounts']) => void) {
  const client = getClient();
  const handleChange = () => callback(getAccounts());

  // unsubscribe
  return client.subscribe(
    ({ accounts }) => {
      return accounts;
    },
    handleChange,
    { equalityFn }
  );
}

export function getCurrentAccount() {
  const { accounts, currentAccountIndex } = getClient();
  return accounts[currentAccountIndex] ?? null;
}

export function getStxAddress() {
  const { stxAddress } = getClient();
  return stxAddress ?? null;
}

export function watchStxAddress(callback: (payload: MicroStacksClient['stxAddress']) => void) {
  const client = getClient();
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
  callback: (payload: MicroStacksClient['accounts'][number]) => void
) {
  const client = getClient();
  const handleChange = () => callback(getCurrentAccount());

  // unsubscribe
  return client.subscribe(
    ({ accounts, currentAccountIndex }) => {
      return accounts[currentAccountIndex] ?? null;
    },
    handleChange,
    { equalityFn }
  );
}
