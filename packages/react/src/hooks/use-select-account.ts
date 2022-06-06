import { useEffect, useState } from 'react';
import {
  getCurrentAccount,
  getStxAddress,
  watchCurrentAccount,
  watchStxAddress,
} from '@micro-stacks/core';
import { useMicroStacksClient } from './use-client';

export function useAccount(): ReturnType<typeof getCurrentAccount> {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getCurrentAccount(client));
  useEffect(() => {
    return watchCurrentAccount(setState, client);
  }, [client]);

  return state;
}

export function useStxAddress() {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getStxAddress(client));
  useEffect(() => {
    return watchStxAddress(setState, client);
  }, [client]);

  return state;
}
