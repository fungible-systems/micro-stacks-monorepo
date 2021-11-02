import { authenticate, PersistedDataKeys } from 'micro-stacks/connect';
import { useCallback } from 'react';
import { useIsSignedIn, useResetSessionCallback, useSession } from './use-session';
import { useLoading } from './use-loading';
import { LOADING_KEYS } from '../common/constants';
import { useDefaultStorageAdapter } from './use-storage-adapter';
import { useAtomCallback } from 'jotai/utils';
import { authOptionsAtom, isSignedInAtom, stacksSessionAtom } from '../store/auth';

export function useAuth() {
  const [sessionState] = useSession();
  const [isSignedIn] = useIsSignedIn();
  const [isLoading, setIsLoading] = useLoading(LOADING_KEYS.AUTHENTICATION);
  const storageAdapter = useDefaultStorageAdapter();
  const resetSession = useResetSessionCallback();
  const handleSignIn = useAtomCallback<void, { onFinish?: (payload: any) => void }>(
    useCallback(
      async (get, set, { onFinish }) => {
        const authOptions = get(authOptionsAtom);
        if (!authOptions) throw Error('[handleSignIn] No authOptions provided.');
        setIsLoading(true);
        return authenticate(
          {
            ...authOptions,
            onFinish: payload => {
              if (onFinish) onFinish(payload);
              authOptions?.onFinish?.(payload);
              set(stacksSessionAtom, payload);
              set(isSignedInAtom, true);
              setIsLoading(false);
            },
            onCancel: error => {
              console.error(error);
              setIsLoading(false);
            },
          },
          storageAdapter
        );
      },
      [setIsLoading, storageAdapter, stacksSessionAtom, isSignedInAtom, authOptionsAtom]
    )
  );

  const handleSignOut = useAtomCallback(
    useCallback(
      get => {
        const authOptions = get(authOptionsAtom);
        if (!authOptions) throw Error('[handleSignOut] No authOptions provided.');
        storageAdapter.removeItem(PersistedDataKeys.SessionStorageKey);
        resetSession();
        authOptions?.onSignOut?.();
      },
      [resetSession, storageAdapter]
    )
  );

  return {
    isLoading,
    isSignedIn,
    handleSignIn,
    handleSignOut,
    session: sessionState,
  };
}
