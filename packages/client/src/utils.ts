import { ClientConfig, DebugOptions, State } from './common/types';
import { ChainID, StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import { Status, StatusKeys } from './common/constants';
import { getGlobalObject } from 'micro-stacks/common';

export const VERSION = 1;

export function serialize({ state, version }: { state: State; version: number }) {
  return JSON.stringify([
    [state.network?.chainId, state.network?.getCoreApiUrl?.()],
    [state.currentAccountIndex, state.accounts],
    version,
  ]);
}

export function deserialize(str: string) {
  const data = JSON.parse(str);
  const [chainId, apiUrl] = data[0] as [ChainID, string];
  const [currentAccountIndex, accounts] = data[1];
  const version = data[2] ?? VERSION;

  const network =
    chainId === ChainID.Mainnet
      ? new StacksMainnet({ url: apiUrl })
      : new StacksTestnet({ url: apiUrl });

  return {
    network,
    currentAccountIndex,
    accounts,
    version,
  };
}

export const defaultState = ({
  network = new StacksMainnet(),
  ...config
}: ClientConfig): State => ({
  statuses: {
    [StatusKeys.Authentication]: Status.IsIdle,
    [StatusKeys.TransactionSigning]: Status.IsIdle,
    [StatusKeys.MessageSigning]: Status.IsIdle,
    [StatusKeys.StructuredMessageSigning]: Status.IsIdle,
  },
  network: network,
  appName: config.appName,
  appIconUrl: config.appIconUrl,
  accounts: [],
  currentAccountIndex: 0,
  onPersistState: config.onPersistState,
  onAuthentication: config.onAuthentication,
  onSignOut: config.onSignOut,
});

export const hydrate = (str: string, config: ClientConfig) => {
  try {
    const { version, ...state } = deserialize(str);
    return {
      state: {
        ...defaultState(config),
        ...state,
      },
      version,
    };
  } catch (e) {
    return {
      state: defaultState(config),
      version: VERSION,
    };
  }
};

export const getDebugState = () => {
  const storage = getGlobalObject('localStorage', { throwIfUnavailable: false });
  if (!storage) return;
  const debug = localStorage.getItem('MICRO_STACKS_DEBUG');
  if (debug) return JSON.parse(debug) as DebugOptions;
  return;
};
