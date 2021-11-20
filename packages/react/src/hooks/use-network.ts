import { currentNetworkName, networkAtom } from '../store/network';
import { StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { useCallback } from 'react';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { ChainID } from 'micro-stacks/common';

export function useNetwork() {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  const name = useAtomValue(currentNetworkName);
  const setNetwork = useUpdateAtom<
    StacksNetwork | StacksTestnet | StacksMainnet,
    StacksNetwork | StacksTestnet | StacksMainnet,
    void
  >(networkAtom);

  const handleSetNetwork = useCallback(
    (network: StacksNetwork) => setNetwork(network),
    [setNetwork]
  );

  const handleSetTestnet = () => handleSetNetwork(new StacksTestnet());
  const handleSetMainnet = () => handleSetNetwork(new StacksMainnet());

  return {
    network,
    chain: network.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet',
    name,
    handleSetMainnet,
    handleSetTestnet,
    handleSetNetwork,
  };
}

export const useCurrentNetworkChain = () => {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  return network?.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
};

export const useCurrentNetworkUrl = () => {
  const network = useAtomValue<StacksNetwork>(networkAtom);
  return network?.getCoreApiUrl();
};
