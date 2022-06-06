import * as React from 'react';
import { ClientConfig, createClient, getClient } from '@micro-stacks/core';
import { MicroStacksClientContext } from '../common/context';
import {
  useOnAuthenticationEffect,
  useOnPersistEffect,
  useOnSignOutEffect,
} from '../hooks/use-client-callbacks';
import { memo, useMemo } from 'react';

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
    client?: ReturnType<typeof getClient>;
  } & ClientConfig
> = React.memo(
  ({
    children,
    client: client_,
    dehydratedState,
    appIconUrl,
    appName,
    network,
    storage,
    onPersistState,
    onAuthentication,
    onSignOut,
  }) => {
    const client = useMemo(
      () =>
        client_ ??
        createClient({
          appName,
          appIconUrl,
          dehydratedState,
          network,
          storage,
          onPersistState,
          onAuthentication,
          onSignOut,
        }),
      [client_, appName, appIconUrl, dehydratedState, network, storage]
    );
    return (
      <MicroStacksClientContext.Provider value={client}>
        {!client_ ? (
          <CallbacksProvider
            onPersistState={onPersistState}
            onAuthentication={onAuthentication}
            onSignOut={onSignOut}
          />
        ) : null}
        {children}
      </MicroStacksClientContext.Provider>
    );
  }
);
