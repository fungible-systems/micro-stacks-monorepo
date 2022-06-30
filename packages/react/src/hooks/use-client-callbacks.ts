import type { ClientConfig } from '@micro-stacks/client';
import { useMicroStacksClient } from './use-client';
import { useEffect } from 'react';
import { useEvent } from '../common/use-event';

type ConfigCallback<K extends keyof ClientConfig> = ClientConfig[K];

/** ------------------------------------------------------------------------------------------------------------------
 *   Setter callbacks
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useSetOnPersistState = () => {
  const client = useMicroStacksClient();
  return client.setOnPersistState;
};

export const useSetOnAuthentication = (): ((
  onAuthentication: ClientConfig['onAuthentication']
) => void) => {
  const client = useMicroStacksClient();
  return client.setOnAuthentication;
};

export const useSetOnSignOut = () => {
  const client = useMicroStacksClient();
  return client.setOnSignOut;
};

/** ------------------------------------------------------------------------------------------------------------------
 *   Setter effects
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useOnAuthenticationEffect = (callback: ConfigCallback<'onAuthentication'>) => {
  const setOnAuthentication = useSetOnAuthentication();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setOnAuthentication(wrapped);
  }, []);
};

export const useOnSignOutEffect = (callback: ConfigCallback<'onSignOut'>) => {
  const setOnSignOut = useSetOnSignOut();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setOnSignOut(wrapped);
  }, []);
};

export const useOnPersistEffect = (callback: ConfigCallback<'onPersistState'>) => {
  const setOnPersistState = useSetOnPersistState();
  const wrapped = useEvent(callback);
  useEffect(() => {
    if (callback) setOnPersistState(wrapped);
  }, []);
};
