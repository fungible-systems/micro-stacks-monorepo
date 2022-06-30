import { useAccount } from './use-account';
import { useStatuses } from './use-statuses';
import { useMicroStacksClient } from './use-client';
import { Client, Status, StatusKeys } from '@micro-stacks/client';

interface UseAuth {
  authenticate: Client['authenticate'];
  signOut: Client['signOut'];
  isSignedIn: boolean;
  isRequestPending: boolean;
}

export const useAuth = (): UseAuth => {
  const client = useMicroStacksClient();
  const account = useAccount();
  const status = useStatuses();
  return {
    /**
     * actions
     */
    authenticate: client.authenticate,
    signOut: client.signOut,
    /**
     * state
     */
    isSignedIn: !!account,
    isRequestPending: status[StatusKeys.Authentication] === Status.IsLoading,
  };
};
