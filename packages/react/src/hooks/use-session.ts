import { useAtom } from 'jotai';
import {
  authOptionsAtom,
  isSignedInAtom,
  partialStacksSessionAtom,
  stacksSessionAtom,
} from '../store/auth';
import { useAtomValue } from 'jotai/utils';
import { StacksSessionState } from 'micro-stacks/connect';
import { useCallback } from 'react';

type SetAtom<Update> = undefined extends Update
  ? (update?: Update) => void
  : (update: Update) => void;

export function useSession(): [
  null | Partial<StacksSessionState>,
  SetAtom<StacksSessionState | null>
] {
  const [partialSession] = useAtom(partialStacksSessionAtom);
  const [session, setSession] = useAtom(stacksSessionAtom);

  const combined =
    !session && !partialSession
      ? null
      : ({
          ...(session || {}),
          ...(partialSession || {}),
        } as Partial<StacksSessionState>);
  return [combined, setSession as SetAtom<StacksSessionState | null>];
}

export function useResetSessionCallback() {
  const [, setPartial] = useAtom(partialStacksSessionAtom);
  const [, setSession] = useAtom(stacksSessionAtom);
  return useCallback(() => {
    setPartial(null);
    setSession(null);
  }, [setPartial, setSession]);
}

export function useAuthOptions() {
  return useAtomValue(authOptionsAtom);
}

/**
 * Get if the user is currently signed in
 *
 * @return [isSignedIn: boolean, setIsSignedIn: SetAtom<boolean>]
 */
export function useIsSignedIn(): boolean {
  return useAtomValue(isSignedInAtom);
}
