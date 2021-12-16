import { AppProviderAtomBuilder } from '@micro-stacks/react';
import { InitialValuesAtomBuilder } from 'jotai-query-toolkit/nextjs';
import { buildMicroStacksAtoms } from '../builders/build-micro-stacks-atoms';
import { getStacksNetworkFromCookies, resetSessionCookies, setSessionCookies } from './cookies';

export function getAtomBuilders(
  options: AppProviderAtomBuilder,
  initialValuesAtomBuilders: InitialValuesAtomBuilder[] = []
) {
  return [
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
  ];
}
