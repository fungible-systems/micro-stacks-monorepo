import { useContext } from 'react';
import { MicroStacksClientContext } from '../common/context';
import type { Client } from '@micro-stacks/client';

export const useMicroStacksClient = () => {
  const client = useContext<Client | null>(MicroStacksClientContext);
  if (!client) {
    throw new Error(
      'No MicroStacksClient set, wrap your app in MicroStacksClientProvider to set one'
    );
  }
  return client;
};
