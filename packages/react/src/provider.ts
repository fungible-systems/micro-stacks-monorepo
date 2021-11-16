import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { createElement, useMemo } from 'react';
import { Provider } from 'jotai';
import hash from 'stable-hash';

import { authOptionsAtom } from './store/auth';
import { networkValueAtom } from './store/network';
import { getNetwork } from './common/utils';

import type { FC } from 'react';
import type { AuthOptions } from 'micro-stacks/connect';
import type { Atom } from 'jotai';

export type NetworkType = StacksNetwork | 'mainnet' | 'testnet' | 'mocknet';

export interface MicroStacksProviderProps {
  authOptions: AuthOptions;
  network?: NetworkType;
  initialValues?: Iterable<readonly [Atom<unknown>, unknown]>;
}

export const MicroStacksProvider: FC<MicroStacksProviderProps> = ({
  children,
  authOptions,
  network = new StacksMainnet(),
  initialValues: additionalInitialValues = [],
}) => {
  const networkValue = useMemo(() => getNetwork(network), [network]);

  const initialValues = useMemo(
    () => [
      [authOptionsAtom, authOptions] as const,
      [networkValueAtom, networkValue] as const,
      ...additionalInitialValues,
    ],
    [authOptions, networkValue, additionalInitialValues]
  );

  const key = useMemo(() => hash([initialValues]), [initialValues]);

  const props = useMemo(() => ({ initialValues, key }), [initialValues, key]);

  return createElement(Provider, props, children);
};
