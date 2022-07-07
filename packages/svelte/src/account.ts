import {
  getAccounts,
  getCurrentAccount,
  getStxAddress,
  watchAccounts as _watchAccounts,
  watchCurrentAccount,
  watchStxAddress as _watchStxAddress,
} from '@micro-stacks/client';
import { derived } from 'svelte/store';
import { readableClientState } from './utils';

export const watchAccounts = readableClientState(getAccounts, _watchAccounts);
export const watchAccount = readableClientState(getCurrentAccount, watchCurrentAccount);
export const watchStxAddress = readableClientState(getStxAddress, _watchStxAddress);

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
