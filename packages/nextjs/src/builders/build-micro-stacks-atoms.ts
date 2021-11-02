import { InitialValuesAtomBuilder } from 'jotai-query-toolkit/nextjs';
import {
  networkValueAtom,
  storageAdapterAtom,
  getNetwork,
  MicroStacksProviderAtoms,
  AppProviderAtomBuilder,
  _isSignedInAtom,
  authOptionsAtom,
  partialStacksSessionAtom,
} from '@micro-stacks/react';

import { useCookiesAtom } from '../common/cookies';

import { defaultStorageAdapter } from 'micro-stacks/connect';
import { Atom } from 'jotai/core/atom';

type Builders = Record<
  MicroStacksProviderAtoms,
  (options: AppProviderAtomBuilder) => (propData: any) => readonly [Atom<unknown>, unknown]
>;
const builders: Builders = {
  [MicroStacksProviderAtoms.AuthOptions]: (options: AppProviderAtomBuilder) =>
    function buildAuthOptionsAtom(value: AppProviderAtomBuilder['authOptions']) {
      return [authOptionsAtom, value || options.authOptions] as const;
    },
  [MicroStacksProviderAtoms.StorageAdapter]: (options: AppProviderAtomBuilder) =>
    function buildStorageAdapterAtom(value: AppProviderAtomBuilder['storageAdapter']) {
      return [
        storageAdapterAtom,
        value || options.storageAdapter || defaultStorageAdapter,
      ] as const;
    },
  [MicroStacksProviderAtoms.Network]: (options: AppProviderAtomBuilder) =>
    function buildNetworkAtom(value: AppProviderAtomBuilder['network']) {
      return [networkValueAtom, getNetwork(value || options.network)] as const;
    },
  [MicroStacksProviderAtoms.PartialStacksSession]: (options: AppProviderAtomBuilder) =>
    function buildPartialStacksSessionAtom(value: AppProviderAtomBuilder['partialStacksSession']) {
      return [partialStacksSessionAtom, value || options.partialStacksSession] as const;
    },
  [MicroStacksProviderAtoms.EnableCookies]: (_options: AppProviderAtomBuilder) =>
    function buildEnableCookiesAtom(value?: boolean) {
      return [useCookiesAtom, typeof value === 'boolean' ? value : true] as const;
    },
  [MicroStacksProviderAtoms.IsSignedIn]: (_options: AppProviderAtomBuilder) =>
    function buildIsSignedInAtom(value?: boolean) {
      return [_isSignedInAtom, typeof value === 'boolean' ? value : false] as const;
    },
};

/**
 * buildMicroStacksAtoms
 *
 * This is used with `jotai-query-toolkit` and next.js
 * This is a method to create InitialValuesAtomBuilder for `withInitialQueries`
 * Use this in place of `MicroStacksProvider`
 * @example
 *
 * ```tsx
 * const providerAtoms = buildMicroStacksAtoms({
 *   network: "testnet",
 *   authOptions: {
 *     appDetails: {
 *       name: "micro-stacks <> next.js",
 *       icon: "/",
 *     },
 *   },
 * });
 * const queries: GetQueries<any> = () => [["some-key", () => "someQueryFn"]];
 * export default withInitialQueries(NextjsPageComponent, providerAtoms)(queries);
 *
 * ```
 * @param options - {@link AppProviderAtomBuilder}
 */
export const buildMicroStacksAtoms = (
  options: AppProviderAtomBuilder
): InitialValuesAtomBuilder<MicroStacksProviderAtoms>[] => {
  return (Object.keys(builders) as MicroStacksProviderAtoms[]).map(key => [
    key,
    (builders as Builders)[key](options),
  ]);
};
