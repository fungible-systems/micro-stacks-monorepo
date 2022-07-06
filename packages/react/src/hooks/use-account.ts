import { useEffect, useState } from 'react';
import {
  getAccounts,
  getCurrentAccount,
  getDecentralizedID,
  getIdentityAddress,
  getStxAddress,
  watchAccounts,
  watchCurrentAccount,
  watchDecentralizedID,
  watchIdentityAddress,
  watchStxAddress,
} from '@micro-stacks/client';
import { useMicroStacksClient } from './use-client';

function useWatchAccounts(): ReturnType<typeof getAccounts> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getAccounts(client));
  useEffect(() => {
    return watchAccounts(setState, client);
  }, [client]);

  return state;
}

function useWatchAccount(): ReturnType<typeof getCurrentAccount> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getCurrentAccount(client));
  useEffect(() => {
    return watchCurrentAccount(setState, client);
  }, [client]);

  return state;
}

function useIdentityAddress(): ReturnType<typeof getIdentityAddress> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getIdentityAddress(client));
  useEffect(() => {
    return watchIdentityAddress(setState, client);
  }, [client]);

  return state;
}

function useDecentralizedID(): ReturnType<typeof getIdentityAddress> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getDecentralizedID(client));
  useEffect(() => {
    return watchDecentralizedID(setState, client);
  }, [client]);

  return state;
}

function useWatchStxAddress() {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getStxAddress(client));
  useEffect(() => {
    return watchStxAddress(setState, client);
  }, [client]);

  return state;
}

function useAccount() {
  const account = useWatchAccount();
  const stxAddress = useWatchStxAddress();
  const identityAddress = useIdentityAddress();
  const decentralizedID = useDecentralizedID();

  return {
    appPrivateKey: account?.appPrivateKey ?? null,
    rawAddress: account?.address,
    identityAddress,
    decentralizedID,
    stxAddress,
    profileUrl: account?.profile_url,
  };
}

function useIsGaiaAvailable() {
  return !!useAccount().appPrivateKey;
}

export {
  useAccount,
  useWatchStxAddress as useCurrentStxAddress,
  useWatchAccounts as useAccountsRaw,
  useIsGaiaAvailable,
};
