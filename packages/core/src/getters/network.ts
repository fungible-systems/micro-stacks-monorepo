import equalityFn from 'fast-deep-equal/es6';
import { State } from '../common/types';
import { getClient } from '../client/create-client';

export function getNetwork() {
  const { network } = getClient();
  return network;
}

export function watchNetwork(callback: (payload: State['network']) => void) {
  const client = getClient();
  const handleChange = () => callback(getNetwork());

  return client.subscribe(
    ({ network }) => {
      return network;
    },
    handleChange,
    { equalityFn }
  );
}
