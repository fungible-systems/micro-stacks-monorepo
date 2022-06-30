import { useEffect, useState } from 'react';
import { getStatus, watchStatus } from '@micro-stacks/client';
import { useMicroStacksClient } from './use-client';

export function useStatuses() {
  const client = useMicroStacksClient();
  const [state, setState] = useState(getStatus(client));
  useEffect(() => {
    return watchStatus(setState, client);
  }, [client]);
  return state;
}
