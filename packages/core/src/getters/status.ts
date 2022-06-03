import { State } from '../common/types';
import { getClient } from '../client/create-client';

export function getStatus() {
  const { statuses } = getClient();
  return statuses;
}

export function watchStatus(callback: (payload: State['statuses']) => void) {
  const client = getClient();
  const handleChange = () => callback(getStatus());

  return client.subscribe(
    ({ statuses }) => {
      return statuses;
    },
    handleChange,
    { equalityFn: (selected, previous) => selected === previous }
  );
}
