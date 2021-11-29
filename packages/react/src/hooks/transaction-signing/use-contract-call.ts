import { useCallback, useMemo, useState } from 'react';
import hash from 'stable-hash';

import { useLoading } from '../use-loading';
import { useTransactionPopup } from './use-transaction-popup';

import type { MakeContractCallOptions } from './types';
import { SetOptional } from '../../common/types';

export type UseContractCallParams = SetOptional<
  MakeContractCallOptions,
  'functionName' | 'functionArgs' | 'postConditionMode' | 'postConditions'
>;

export interface HandleContractCallParams {
  functionName?: MakeContractCallOptions['functionName'];
  functionArgs?: MakeContractCallOptions['functionArgs'];
  postConditionMode?: MakeContractCallOptions['postConditionMode'];
  postConditions?: MakeContractCallOptions['postConditions'];
  onFinish?: MakeContractCallOptions['onFinish'];
  onCancel?: MakeContractCallOptions['onCancel'];
}

export function useContractCall(options: UseContractCallParams) {
  const _key = useMemo(() => hash([options]), [options]);

  const [key, setKey] = useState(_key);
  const [isLoading, setIsLoading] = useLoading(key);
  const popup = useTransactionPopup();

  const handleContractCall = useCallback(
    async (params?: HandleContractCallParams) => {
      if (!options.functionName && !params?.functionName)
        throw TypeError('[micro-stacks/react] handleContractCall: functionName is required');

      if (!options.functionArgs && !params?.functionArgs)
        throw TypeError('[micro-stacks/react] handleContractCall: functionArgs is required');
      setIsLoading(true);

      const finalOptions: MakeContractCallOptions = {
        ...options,
        functionArgs: (params?.functionArgs || options.functionArgs)!,
        functionName: (params?.functionName || options.functionName)!,
        postConditionMode: (params?.postConditionMode || options.postConditionMode)!,
        postConditions: (params?.postConditions || options.postConditions)!,
        onFinish(payload) {
          params?.onFinish?.(payload);
          options?.onFinish?.(payload);
          setIsLoading(false);
        },
        onCancel(payload) {
          params?.onCancel?.(payload);
          options?.onCancel?.(payload);
          setIsLoading(false);
        },
      };

      const updatedKey = hash(finalOptions);

      if (key !== updatedKey) setKey(updatedKey);

      await popup.handleContractCall(finalOptions);
    },
    [options, key, setKey]
  );

  return {
    handleContractCall,
    isLoading,
  };
}
