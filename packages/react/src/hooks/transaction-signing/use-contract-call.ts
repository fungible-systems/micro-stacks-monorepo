import { useCallback, useMemo } from 'react';
import hash from 'stable-hash';

import { useLoading } from '../use-loading';
import { useTransactionPopup } from './use-transaction-popup';

import type { MakeContractCallOptions } from './types';

export function useContractCall(options: MakeContractCallOptions) {
  const key = useMemo(() => hash([options]), [options]);
  const [isLoading, setIsLoading] = useLoading(key);
  const popup = useTransactionPopup();

  const handleContractCall = useCallback(async () => {
    setIsLoading(true);
    await popup.handleContractCall({
      ...options,
      onFinish(payload) {
        options?.onFinish?.(payload);
        setIsLoading(false);
      },
      onCancel(payload) {
        options?.onCancel?.(payload);
        setIsLoading(false);
      },
    });
  }, [options]);

  return {
    handleContractCall,
    isLoading,
  };
}
