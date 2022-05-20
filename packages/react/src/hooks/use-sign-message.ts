import { useCallback, useState } from 'react';
import { handleSignMessageRequest } from 'micro-stacks/connect';

import { useAuthOptions, useSession } from './use-session';
import { useNetwork } from './use-network';

import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';

export const useSignMessage = () => {
  const [session] = useSession();
  const authOptions = useAuthOptions();
  const { network, chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignMessage = useCallback(
    async ({ message, onFinish, onCancel }: SignedOptionsWithOnHandlers<{ message: string }>) => {
      if (!authOptions?.appDetails || !session?.addresses || !session?.appPrivateKey) return;
      setIsLoading(true);
      await handleSignMessageRequest({
        message,
        appDetails: authOptions.appDetails,
        stxAddress: (session.addresses as any)?.[chain] as string,
        privateKey: session.appPrivateKey,
        onFinish: payload => {
          onFinish?.(payload);
          setIsLoading(false);
        },
        onCancel: () => {
          onCancel?.();
          setIsLoading(false);
        },
        network,
      });
      if (isLoading) setIsLoading(false);
    },
    [authOptions, session]
  );

  return {
    handleSignMessage,
    isLoading,
  };
};
