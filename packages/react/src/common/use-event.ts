import * as React from 'react';
import { getGlobalObject } from 'micro-stacks/common';
import type { DependencyList, EffectCallback } from 'react';

const useLayoutEffect = (effect: EffectCallback, deps?: DependencyList) =>
  Boolean(getGlobalObject('document')) ? React.useLayoutEffect(effect, deps) : undefined;

export const useEvent = (onEvent: any) => {
  const handleEventRef = React.useRef(onEvent);

  useLayoutEffect(() => {
    handleEventRef.current = onEvent;
  }, []);

  return React.useCallback((...args) => handleEventRef.current(...args), []);
};
