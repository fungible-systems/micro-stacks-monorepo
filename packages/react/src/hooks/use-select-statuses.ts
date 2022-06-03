import { useEffect, useState } from 'react';
import { getStatus, watchStatus } from '@micro-stacks/core';

export function useStatuses() {
  const [state, setState] = useState(getStatus());
  useEffect(() => {
    return watchStatus(setState);
  }, []);
  return state;
}
