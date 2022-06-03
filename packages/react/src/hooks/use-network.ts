import { useMicroStacksClient } from './use-client';
import { ChainID, StacksNetwork } from 'micro-stacks/network';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNetwork, watchNetwork } from '@micro-stacks/core';

interface UseNetwork {
  network: StacksNetwork;
  isMainnet: boolean;
  setNetwork: (network: 'mainnet' | 'testnet' | StacksNetwork) => void;
}

export function useNetwork(): UseNetwork {
  const client = useMicroStacksClient();
  const [network, setState] = useState(getNetwork());

  useEffect(() => {
    return watchNetwork(setState);
  }, []);

  network.isMainnet = useCallback(() => network.chainId === ChainID.Mainnet, [network.chainId]);

  const isMainnet = useMemo(() => network.isMainnet(), [network]);

  return {
    /**
     * actions
     */
    setNetwork: client.setNetwork,
    /**
     * state
     */
    network,
    isMainnet,
  };
}
