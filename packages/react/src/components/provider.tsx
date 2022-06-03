import * as React from 'react';
import { getClient } from '@micro-stacks/core';
import { MicroStacksClientContext } from '../common/context';

export const MicroStacksClientProvider: React.FC<{
  client: ReturnType<typeof getClient>;
}> = React.memo(({ children, client = getClient() }) => {
  return (
    <MicroStacksClientContext.Provider value={client}>{children}</MicroStacksClientContext.Provider>
  );
});
