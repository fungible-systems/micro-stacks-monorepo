import { StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { PersistedDataKeys } from 'micro-stacks/connect';

import { atom } from 'jotai';
import { ChainID } from 'micro-stacks/common';
import { atomWithStorageBroadcastChannel } from '../common/storage-with-broadcast-channel';

function serializeNetwork(network: StacksNetwork): string {
  return JSON.stringify([network.getCoreApiUrl(), network.chainId]);
}

function deserializeNetwork(serialized: string): StacksTestnet | StacksMainnet {
  const [coreApiUrl, chainId] = JSON.parse(serialized);
  const Builder = chainId === ChainID.Mainnet ? StacksMainnet : StacksTestnet;
  return new Builder({
    url: coreApiUrl,
  });
}

function getNetworkName(network: StacksNetwork) {
  switch (network.getCoreApiUrl()) {
    case 'https://stacks-node-api.mainnet.stacks.co':
      return 'mainnet';
    case 'https://stacks-node-api.testnet.stacks.co':
      return 'testnet';
  }
  if (network.chainId === ChainID.Testnet) return 'testnet';
  return 'mainnet';
}

export const networkValueAtom = atom(new StacksMainnet());
networkValueAtom.debugLabel = 'networkValueAtom';

export const networkAtom = atomWithStorageBroadcastChannel<
  StacksNetwork | StacksTestnet | StacksMainnet
>(
  PersistedDataKeys.NetworkStorageKey,
  get => get(networkValueAtom),
  serializeNetwork,
  deserializeNetwork
);

networkAtom.debugLabel = 'networkAtom';

export const currentNetworkUrl = atom(get => get(networkAtom).getCoreApiUrl());
networkAtom.debugLabel = 'currentNetworkUrl';

export const currentNetworkName = atom(get => {
  const network = get(networkAtom);
  return getNetworkName(network);
});

currentNetworkName.debugLabel = 'currentNetworkName';
