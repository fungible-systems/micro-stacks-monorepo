import { useAccount } from './use-select-account';
import { useStatuses } from './use-select-statuses';
import { useMicroStacksClient } from './use-client';
import { Client, Status, StatusKeys } from '@micro-stacks/client';

interface UseAuth {
  authenticate: Client['authenticate'];
  signOut: Client['signOut'];
  isSignedIn: boolean;
  isLoading: boolean;
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
    isLoading: status[StatusKeys.Authentication] === Status.IsLoading,
  };
};
