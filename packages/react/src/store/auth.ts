import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { PersistedDataKeys } from 'micro-stacks/connect';
import { atomWithStorageBroadcastChannel } from '../common/storage-with-broadcast-channel';
import type { StacksSessionState, AuthOptions } from 'micro-stacks/connect';

export const authOptionsAtom = atom<AuthOptions | null>(null);

export const partialStacksSessionAtom = atom<null | Partial<StacksSessionState>>(null);

export const stacksSessionAtom = atomWithStorageBroadcastChannel<StacksSessionState | null>(
  PersistedDataKeys.SessionStorageKey,
  null
);

const combinedSessionAtom = atom(get => {
  const partial = get(partialStacksSessionAtom);
  const full = get(stacksSessionAtom);
  return typeof partial === 'undefined' && typeof full === 'undefined'
    ? null
    : {
        ...(partial || {}),
        ...(full || {}),
      };
});

export const userDataAtom = atom<null | {
  appPrivateKey?: string;
  hubUrl?: string;
  profile_url?: string;
  addresses: {
    mainnet: string;
    testnet: string;
  };
}>(get => {
  const state = get(combinedSessionAtom);
  if (state?.addresses && state.addresses.mainnet) {
    return {
      appPrivateKey: state!.appPrivateKey,
      hubUrl: state.hubUrl,
      addresses: state!.addresses,
      profile_url: state!.profile_url,
      identityAddress: state!.identityAddress,
    };
  }
  return null;
});

export const isSignedInAtom = atom<boolean>(
  get => !!get(stacksSessionAtom) || !!get(partialStacksSessionAtom)
);

export const userStxAddressesAtom = selectAtom(userDataAtom, state => state?.addresses);
