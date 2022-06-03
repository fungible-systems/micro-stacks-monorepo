import { ClientConfig } from '../common/types';
import { MicroStacksClient } from './micro-stacks-client';

export let client: MicroStacksClient;

export type Client = typeof client;

export function createClient(config: ClientConfig) {
  const client_ = new MicroStacksClient(config);
  client = client_;
  return client_;
}

export function getClient() {
  if (!client) {
    console.warn('No client defined. Falling back to default client.');
    return new MicroStacksClient();
  }

  return client;
}
