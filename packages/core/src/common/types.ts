import type {
  AuthOptions,
  ContractCallTxOptions,
  ContractDeployTxOptions,
  FinishedTxData,
  StacksSessionState,
  StxTransferTxOptions,
} from 'micro-stacks/connect';
import type { StacksNetwork } from 'micro-stacks/network';
import type { ClientStorage } from './storage';
import { Status, StatusKeys, TxType } from './constants';

export interface AppDetails {
  /** A human-readable name for your application */
  name: string;
  /** A full URL that resolves to an image icon for your application */
  icon: string;
}

export type ContractCallParams = Omit<
  ContractCallTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};
export type StxTransferParams = Omit<
  StxTransferTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};
export type ContractDeployParams = Omit<
  ContractDeployTxOptions,
  'network' | 'privateKey' | 'appDetails' | 'stxAddress'
> & {
  onFinish?: (payload: FinishedTxData) => void;
  onCancel?: (error?: string) => void;
};

export interface SignTransactionRequest {
  (type: TxType.ContractDeploy, params: ContractDeployParams): Promise<FinishedTxData | undefined>;

  (type: TxType.ContractCall, params: ContractCallParams): Promise<FinishedTxData | undefined>;

  (type: TxType.TokenTransfer, params: StxTransferParams): Promise<FinishedTxData | undefined>;
}

type getInitialState = (key: string) => string | undefined;

export interface ClientConfig {
  storage?: ClientStorage;
  appDetails?: AuthOptions['appDetails'];
  network?: StacksNetwork;
  dehydratedState?: string | getInitialState;
  onSignOut?: () => void;
  onAuthenticate?: (payload: StacksSessionState) => void;
}

export type State = {
  appDetails?: AuthOptions['appDetails'];
  statuses: {
    [StatusKeys.Authentication]: Status;
    [StatusKeys.TransactionSigning]: Status;
    [StatusKeys.MessageSigning]: Status;
    [StatusKeys.StructuredMessageSigning]: Status;
  };
  network: StacksNetwork;
  currentAccountIndex: number;
  accounts: { appPrivateKey?: string; address: string }[];
};
