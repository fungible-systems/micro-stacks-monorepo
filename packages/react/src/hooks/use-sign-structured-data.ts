import { useCallback, useState } from 'react';
import { handleSignStructuredDataRequest } from 'micro-stacks/connect';

import { useAuthOptions, useSession } from './use-session';
import { useNetwork } from './use-network';

import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';

export const useSignStructuredData = () => {
  const [session] = useSession();
  const authOptions = useAuthOptions();
  const { network, chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignStructuredData = useCallback(
    async ({
      message,
      onFinish,
      onCancel,
    }: SignedOptionsWithOnHandlers<{ message: string | ClarityValue }>) => {
      if (!authOptions?.appDetails || !session?.addresses || !session?.appPrivateKey) return;
      setIsLoading(true);
      return handleSignStructuredDataRequest({
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
    },
    [authOptions, session]
  );

  return {
    handleSignStructuredData,
    isLoading,
  };
};
