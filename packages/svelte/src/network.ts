import { getNetwork, watchNetwork as _watchNetwork } from '@micro-stacks/client';
import { ChainID, StacksNetwork } from 'micro-stacks/network';
import { derived, readable } from 'svelte/store';

import { getClient } from './store';

interface Network {
  network: StacksNetwork;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => void;
}

function networkStore() {
  const client = getClient();

  return readable(getNetwork(client), set => {
    return _watchNetwork(set, client);
  });
}

export function watchNetwork() {
  const client = getClient();

  const modifyNetwork = (network: StacksNetwork): Network => {
    network.isMainnet = () => network.chainId === ChainID.Mainnet;

    return {
      /**
       * actions
       */
      setNetwork: client.setNetwork,
      /**
       * state
       */
      network,
      isMainnet: network.isMainnet(),
    };
  };

  return derived([networkStore()], ([network]: [StacksNetwork]) => {
    return modifyNetwork(network!);
  });
}
