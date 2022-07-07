import { Status, StatusKeys, StxTransferParams, TxType } from '@micro-stacks/client';
import { FinishedTxData } from 'micro-stacks/connect';
import { getClient, watchStatuses } from 'src';
import { derived } from 'svelte/store';

export interface OptionalParams {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
}

export function getOpenStxTokenTransfer(callbacks?: OptionalParams) {
  const client = getClient();

  return derived([watchStatuses()], ([status]) => {
    const openStxTokenTransfer = (params: StxTransferParams) =>
      client.signTransaction(TxType.TokenTransfer, {
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
    const isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

    return {
      openStxTokenTransfer,
      isRequestPending,
    };
  });
}
