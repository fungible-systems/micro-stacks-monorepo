import { readable } from 'svelte/store';
import { getStatus, watchStatus } from '@micro-stacks/client';
import { getClient } from './store';

export function watchStatuses() {
  const client = getClient();

  return readable(getStatus(client), set => {
    return watchStatus(set, client);
  });
}
