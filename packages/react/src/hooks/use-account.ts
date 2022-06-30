import { useEffect, useState } from 'react';
import {
  getAccounts,
  getCurrentAccount,
  getStxAddress,
  watchAccounts,
  watchCurrentAccount,
  watchStxAddress,
} from '@micro-stacks/client';
import { useMicroStacksClient } from './use-client';

export function useWatchAccounts(): ReturnType<typeof getAccounts> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getAccounts(client));
  useEffect(() => {
    return watchAccounts(setState, client);
  }, [client]);

  return state;
}

export function useWatchAccount(): ReturnType<typeof getCurrentAccount> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getCurrentAccount(client));
  useEffect(() => {
    return watchCurrentAccount(setState, client);
  }, [client]);

  return state;
}

export function useWatchStxAddress() {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getStxAddress(client));
  useEffect(() => {
    return watchStxAddress(setState, client);
  }, [client]);

  return state;
}

export function useAccount() {
  const account = useWatchAccount();
  const stxAddress = useWatchStxAddress();

  return {
    appPrivateKey: account?.appPrivateKey ?? null,
    rawAddress: account.address,
    stxAddress,
  };
}

export { useWatchStxAddress as useCurrentStxAddress };
