import { Status, StatusKeys } from '@micro-stacks/client';
import { derived } from 'svelte/store';
import { getAccount } from './account';
import { watchStatuses } from './status';
import { getClient } from './store';

export function getAuth() {
  const client: any = getClient();

  return derived([getAccount(), watchStatuses()], ([$account, $status]) => {
    return {
      /**
       * actions
       */
      authenticate: client.authenticate,
      signOut: client.signOut,
      /**
       * state
       */
      isSignedIn: !!$account,
      isRequestPending: $status[StatusKeys.Authentication] === Status.IsLoading,
    };
  });
}
