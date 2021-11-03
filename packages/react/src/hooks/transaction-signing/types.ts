import {
  ContractCallTxOptions,
  ContractDeployTxOptions,
  StxTransferTxOptions,
  TransactionPayloadBase,
} from 'micro-stacks/connect';

export interface MakeContractCallOptions extends Omit<ContractCallTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}

export interface MakeContractDeployOptions extends Omit<ContractDeployTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}

export interface MakeStxTransferOptions extends Omit<StxTransferTxOptions, 'privateKey'> {
  onFinish?: TransactionPayloadBase['onFinish'];
  onCancel?: TransactionPayloadBase['onCancel'];
}
