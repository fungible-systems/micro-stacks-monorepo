import { ContractCallParams, Status, StatusKeys, TxType } from '@micro-stacks/client';
import { FinishedTxData } from 'micro-stacks/connect';
import { getClient, watchStatuses } from 'src';
import { derived, Readable } from 'svelte/store';

interface OptionalParams {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
}

interface OpenContractCall {
  openContractCall: (params: ContractCallParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export function getOpenContractCall(callbacks?: OptionalParams): Readable<OpenContractCall> {
  const client = getClient();

  return derived([watchStatuses()], ([$status]) => {
    const openContractCall = (params: ContractCallParams) =>
      client.signTransaction(TxType.ContractCall, {
        ...params,
        onFinish: (payload: FinishedTxData) => {
          params?.onFinish?.(payload);
          callbacks?.onFinish?.(payload);
        },
        onCancel: (error: string | undefined) => {
          params?.onCancel?.(error);
          callbacks?.onCancel?.(error);
        },
      });
    const isRequestPending = $status[StatusKeys.TransactionSigning] === Status.IsLoading;

    return {
      openContractCall,
      isRequestPending,
    };
  });
}
