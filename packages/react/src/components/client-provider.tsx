import * as React from 'react';
import { ClientConfig, getClient } from '@micro-stacks/core';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';
import { memo } from 'react';

// not to be exported
const CallbacksProvider: React.FC<
  Pick<ClientConfig, 'onAuthentication' | 'onSignOut' | 'onPersistState'>
> = memo(({ onPersistState, onAuthentication, onSignOut }) => {
  useOnAuthenticationEffect(onAuthentication);
  useOnSignOutEffect(onSignOut);
  useOnPersistEffect(onPersistState);
  return null;
});

export const ClientProvider: React.FC<
  {
    client: ReturnType<typeof getClient>;
  } & Pick<ClientConfig, 'onAuthentication' | 'onSignOut' | 'onPersistState'>
> = React.memo(
  ({ children, client = getClient(), onPersistState, onAuthentication, onSignOut }) => {
    return (
      <MicroStacksClientContext.Provider value={client}>
        <CallbacksProvider
          onPersistState={onPersistState}
          onAuthentication={onAuthentication}
          onSignOut={onSignOut}
        />
        {children}
      </MicroStacksClientContext.Provider>
    );
  }
);
