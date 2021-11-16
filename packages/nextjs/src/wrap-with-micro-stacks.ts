import { InitialValuesAtomBuilder, withInitialQueryData } from 'jotai-query-toolkit/nextjs';
import {
  getStacksNetworkFromCookies,
  resetSessionCookies,
  setSessionCookies,
} from './common/cookies';
import { buildMicroStacksAtoms } from './builders/build-micro-stacks-atoms';
import type { AppProviderAtomBuilder } from '@micro-stacks/react';
import type { NextPage } from 'next';

export function wrapWithMicroStacks(options: AppProviderAtomBuilder) {
  return function Wrapper<T>(
    page: NextPage<T>,
    initialValuesAtomBuilders: InitialValuesAtomBuilder[] = []
  ) {
    return withInitialQueryData(page, [
      ...buildMicroStacksAtoms({
        authOptions: {
          ...options.authOptions,
          onFinish(payload) {
            options?.authOptions?.onFinish?.(payload);
            setSessionCookies(payload);
          },
          onSignOut() {
            resetSessionCookies();
            options?.authOptions?.onSignOut?.();
          },
        },
        network: options.network || getStacksNetworkFromCookies(),
      }),
      ...initialValuesAtomBuilders,
    ]);
  };
}
