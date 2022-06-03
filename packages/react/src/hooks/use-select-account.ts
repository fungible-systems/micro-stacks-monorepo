import { useEffect, useState } from 'react';
import {
  getCurrentAccount,
  getStxAddress,
  watchCurrentAccount,
  watchStxAddress,
} from '@micro-stacks/core';

export function useAccount(): ReturnType<typeof getCurrentAccount> {
  const [state, setState] = useState(getCurrentAccount());
  useEffect(() => {
    return watchCurrentAccount(setState);
  }, []);
  return state;
}

export function useStxAddress() {
  const [state, setState] = useState(getStxAddress());
  useEffect(() => {
    return watchStxAddress(setState);
  }, []);
  return state;
}
