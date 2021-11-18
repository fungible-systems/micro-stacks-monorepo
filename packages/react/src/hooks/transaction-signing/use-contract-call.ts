import { useCallback, useMemo } from 'react';
import hash from 'stable-hash';

import { useLoading } from '../use-loading';
import { useTransactionPopup } from './use-transaction-popup';

import type { MakeContractCallOptions } from './types';

export function useContractCall(options: MakeContractCallOptions) {
  const key = useMemo(() => hash([options]), [options]);
  const [isLoading, setIsLoading] = useLoading(key);
  const popup = useTransactionPopup();

  const handleContractCall = useCallback(
    async (partialOptions?: {
      onFinish?: MakeContractCallOptions['onFinish'];
      onCancel?: MakeContractCallOptions['onCancel'];
    }) => {
      setIsLoading(true);
      await popup.handleContractCall({
        ...options,
        onFinish(payload) {
          partialOptions?.onFinish?.(payload);
          options?.onFinish?.(payload);
          setIsLoading(false);
        },
        onCancel(payload) {
          partialOptions?.onCancel?.(payload);
          options?.onCancel?.(payload);
          setIsLoading(false);
        },
      });
    },
    [options]
  );

  return {
    handleContractCall,
    isLoading,
  };
}
