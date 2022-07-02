import {
  getAccounts,
  getCurrentAccount,
  getStxAddress,
  watchAccounts as _watchAccounts,
  watchCurrentAccount,
  watchStxAddress as _watchStxAddress,
} from '@micro-stacks/client';
import { derived, readable } from 'svelte/store';
import { getClient } from './store';

export function watchAccounts() {
  const client = getClient();

  return readable(getAccounts(client), set => {
    return _watchAccounts(set, client);
  });
}

export function watchAccount() {
  const client = getClient();

  return readable(getCurrentAccount(client), set => {
    return watchCurrentAccount(set, client);
  });
}

export function watchStxAddress() {
  const client = getClient();

  return readable(getStxAddress(client), set => {
    return _watchStxAddress(set, client);
  });
}

export function getAccount() {
  const account = watchAccount();
  const stxAddress = watchStxAddress();

  return derived([account, stxAddress], ([$account, $stxAddress]) => {
    return {
      appPrivateKey: $account?.appPrivateKey ?? null,
      stxAddress: $stxAddress,
    };
  });
}
