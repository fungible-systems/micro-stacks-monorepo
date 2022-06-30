import { SignatureData, SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import { useMicroStacksClient } from './use-client';
import { useStatuses } from './use-statuses';
import { useCallback, useMemo } from 'react';
import { ClarityValue } from 'micro-stacks/clarity';
import { ChainID } from 'micro-stacks/network';
import { Status, StatusKeys } from '@micro-stacks/client';

interface UseOpenSignStructuredMessage {
  openSignStructuredMessage: (
    params: SignedOptionsWithOnHandlers<{ message: string }>
  ) => Promise<SignatureData | undefined>;
  isRequestPending: boolean;
}

type OpenSignStructuredMessageParams = SignedOptionsWithOnHandlers<{
  message: string | ClarityValue;
  domain?: {
    name?: string;
    version?: string;
    chainId?: ChainID;
  };
}>;

export const useOpenSignStructuredMessage = (
  callbacks?: SignedOptionsWithOnHandlers<{}>
): UseOpenSignStructuredMessage => {
  const client = useMicroStacksClient();
  const status = useStatuses();

  const openSignStructuredMessage = useCallback(
      (params: OpenSignStructuredMessageParams) =>
        client.signStructuredMessage({
          message: params.message,
          domain: params.domain,
          onFinish: payload => {
            params?.onFinish?.(payload);
            callbacks?.onFinish?.(payload);
          },
          onCancel: payload => {
            params?.onCancel?.(payload);
            callbacks?.onCancel?.(payload);
          },
        }),
      [client, callbacks]
    ),
    isRequestPending = useMemo(
      () => status[StatusKeys.MessageSigning] === Status.IsLoading,
      [status]
    );

  return { openSignStructuredMessage, isRequestPending };
};
