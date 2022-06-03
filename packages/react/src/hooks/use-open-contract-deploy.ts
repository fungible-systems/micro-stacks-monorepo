import { OptionalParams } from '../common/types';
import { ContractDeployParams, Status, StatusKeys, TxType } from '@micro-stacks/core';
import { FinishedTxData } from 'micro-stacks/connect';
import { useMicroStacksClient } from './use-client';
import { useStatuses } from './use-select-statuses';
import { useCallback, useMemo } from 'react';

interface UseOpenContractDeploy {
  openContractDeploy: (params: ContractDeployParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
}

export const useOpenContractDeploy = (callbacks?: OptionalParams): UseOpenContractDeploy => {
  const client = useMicroStacksClient();
  const status = useStatuses();

  const openContractDeploy = useCallback(
      (params: ContractDeployParams) =>
        client.signTransaction(TxType.ContractDeploy, {
          ...params,
          onFinish: payload => {
            params?.onFinish?.(payload);
            callbacks?.onFinish?.(payload);
          },
          onCancel: error => {
            params?.onCancel?.(error);
            callbacks?.onCancel?.(error);
          },
        }),
      [client, callbacks]
    ),
    isRequestPending = useMemo(
      () => status[StatusKeys.TransactionSigning] === Status.IsLoading,
      [status]
    );

  return {
    openContractDeploy,
    isRequestPending,
  };
};
