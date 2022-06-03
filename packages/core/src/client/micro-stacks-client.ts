import type { StacksNetwork } from 'micro-stacks/network';
import { ChainID, StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import type { Mutate, StoreApi } from 'zustand/vanilla';
import { default as create } from 'zustand/vanilla';
import type { ClarityValue } from 'micro-stacks/clarity';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type {
  FinishedTxData,
  SignatureData,
  SignedOptionsWithOnHandlers,
  StacksSessionState,
} from 'micro-stacks/connect';
import {
  authenticate,
  handleSignMessageRequest,
  handleSignStructuredDataRequest,
  makeContractCallToken,
  makeContractDeployToken,
  makeStxTransferToken,
  openTransactionPopup,
} from 'micro-stacks/connect';
import { getGlobalObject } from 'micro-stacks/common';
import { invariantWithMessage } from '../common/utils';
import type { ClientStorage } from '../common/storage';
import { DEFAULT_PREFIX, defaultStorage, noopStorage } from '../common/storage';
import { Status, StatusKeys, STORE_KEY, TxType } from '../common/constants';
import type { AppDetails, ClientConfig, SignTransactionRequest, State } from '../common/types';
import {
  c32address,
  c32addressDecode,
  privateKeyToBase58Address,
  StacksNetworkVersion,
} from 'micro-stacks/crypto';
import { SignInWithStacksMessage } from '../siwms';
import { generateGaiaHubConfigSync, getFile, putFile } from 'micro-stacks/storage';

const VERSION = 1;

function serialize({ state, version }: { state: State; version: number }) {
  return JSON.stringify([
    [state.network?.chainId, state.network?.getCoreApiUrl?.()],
    [state.currentAccountIndex, state.accounts],
    version,
  ]);
}

function deserialize(str: string) {
  const data = JSON.parse(str);
  const [chainId, apiUrl] = data[0] as [ChainID, string];
  const [currentAccountIndex, accounts] = data[1];
  const version = data[2] ?? VERSION;

  const network =
    chainId === ChainID.Mainnet
      ? new StacksMainnet({ url: apiUrl })
      : new StacksTestnet({ url: apiUrl });

  return {
    network,
    currentAccountIndex,
    accounts,
    version,
  };
}

const defaultState = ({ network = new StacksMainnet(), appDetails }: ClientConfig) => ({
  statuses: {
    [StatusKeys.Authentication]: Status.IsIdle,
    [StatusKeys.TransactionSigning]: Status.IsIdle,
    [StatusKeys.MessageSigning]: Status.IsIdle,
    [StatusKeys.StructuredMessageSigning]: Status.IsIdle,
  },
  network: network,
  appDetails: appDetails,
  accounts: [],
  currentAccountIndex: 0,
});

export class MicroStacksClient {
  config: ClientConfig;
  storage: ClientStorage;
  store: Mutate<
    StoreApi<State>,
    [['zustand/subscribeWithSelector', never], ['zustand/persist', Partial<State>]]
  >;

  constructor({
    storage = defaultStorage,
    network = new StacksMainnet(),
    appDetails,
    dehydratedState,
    ...config
  }: ClientConfig = {}) {
    const fallbackStore = {
      state: defaultState({ network, appDetails }),
      version: VERSION,
    };

    const hydrate = (str: string) => {
      try {
        const { version, ...state } = deserialize(str);
        return {
          state: {
            ...defaultState({ network, appDetails }),
            ...state,
          },
          version,
        };
      } catch (e) {
        return fallbackStore;
      }
    };

    dehydratedState =
      typeof dehydratedState === 'function' ? dehydratedState(this.storeKey) : dehydratedState;

    const defaultStore = dehydratedState ? hydrate(dehydratedState) : fallbackStore;

    // Create store
    this.store = create(
      subscribeWithSelector(
        persist<State, [['zustand/subscribeWithSelector', never]]>(() => defaultStore.state, {
          name: STORE_KEY,
          getStorage: () => storage,
          version: defaultStore.version,
          serialize: ({ state, version }) => serialize({ state, version: version ?? VERSION }),
          deserialize: hydrate,
        })
      )
    );
    this.config = {
      network,
      appDetails,
      onSignOut: config.onSignOut,
      onAuthenticate: config.onAuthenticate,
    };
    this.storage = storage;
  }

  dehydrate() {
    return serialize({ state: this.store.getState(), version: VERSION });
  }

  setState(updater: State | ((state: State) => State)) {
    const newState = typeof updater === 'function' ? updater(this.store.getState()) : updater;
    this.store.setState(newState, true);
  }

  resetState() {
    this.setState(
      defaultState({ network: this.config.network, appDetails: this.config.appDetails })
    );
  }

  get subscribe() {
    return this.store.subscribe;
  }

  get provider() {
    return getGlobalObject('StacksProvider');
  }

  get storeKey() {
    return DEFAULT_PREFIX + '.' + STORE_KEY;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Session details
   *  ------------------------------------------------------------------------------------------------------------------
   */

  get hasSession() {
    return Boolean(this.accounts.length > 0);
  }

  get accounts() {
    return this.store.getState().accounts ?? [];
  }

  get currentAccountIndex() {
    return this.store.getState().currentAccountIndex ?? 0;
  }

  get account() {
    return this.accounts[this.currentAccountIndex];
  }

  get network() {
    return this.store.getState().network;
  }

  get networkChain(): 'testnet' | 'mainnet' {
    return this.network.chainId === ChainID.Mainnet ? 'mainnet' : 'testnet';
  }

  get testnetStxAddress() {
    if (!this.account) return null;
    const [version, hash] = c32addressDecode(this.account.address);
    return c32address(
      version === StacksNetworkVersion.mainnetP2SH
        ? StacksNetworkVersion.testnetP2SH
        : StacksNetworkVersion.testnetP2PKH,
      hash
    );
  }

  get stxAddress(): string | null {
    if (!this.account) return null;
    if (this.networkChain === 'testnet') return this.testnetStxAddress;
    return this.account.address;
  }

  get appDetails(): AppDetails {
    return this.store.getState().appDetails as AppDetails;
  }

  get identityAddress(): string | undefined {
    if (!this.hasSession || !this.account?.appPrivateKey) return undefined;
    return privateKeyToBase58Address(this.account.appPrivateKey);
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Statuses
   *  ------------------------------------------------------------------------------------------------------------------
   */

  setStatus(key: StatusKeys, status: Status) {
    this.setState(s => ({
      ...s,
      statuses: {
        ...s.statuses,
        [key]: status,
      },
    }));
  }

  setIsLoading(key: StatusKeys) {
    this.setStatus(key, Status.IsLoading);
  }

  setIsIdle(key: StatusKeys) {
    this.setStatus(key, Status.IsIdle);
  }

  get statuses() {
    return this.store.getState().statuses;
  }

  /** ------------------------------------------------------------------------------------------------------------------
   *   Authenticate
   *  ------------------------------------------------------------------------------------------------------------------
   */

  authenticate = async (params?: {
    onFinish?: (session: Omit<StacksSessionState, 'profile'>) => void;
    onCancel?: (error?: Error) => void;
  }) => {
    invariantWithMessage(!!this.provider, 'No StacksProvider found');
    invariantWithMessage(this.appDetails, 'No AppDetails defined');

    this.setIsLoading(StatusKeys.Authentication);
    await authenticate(
      {
        appDetails: this.appDetails,
        onFinish: ({ profile, ...session }) => {
          this.setState(state => ({
            ...state,
            accounts: state.accounts.concat({
              address: session.addresses.mainnet,
              appPrivateKey: session.appPrivateKey,
            }),
          }));
          params?.onFinish?.(session);
          this.config?.onAuthenticate?.({ profile, ...session });
          this.setIsIdle(StatusKeys.Authentication);
        },
        onCancel: error => {
          this.setIsIdle(StatusKeys.Authentication);
          params?.onCancel?.(error);
        },
      },
      noopStorage
    );
  };

  signOut = async (onSignOut?: (() => void) | (() => Promise<void>)) => {
    this.store.persist.clearStorage();
    this.config?.onSignOut?.();
    this.resetState();
    return onSignOut?.();
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign in with Stacks
   *  ------------------------------------------------------------------------------------------------------------------
   */

  getSignInMessage = ({
    domain,
    nonce,
    version = '1.0.0',
  }: {
    domain?: string;
    nonce: string;
    version?: string;
  }) => {
    invariantWithMessage(this.appDetails, 'No AppDetails defined');
    invariantWithMessage(this.stxAddress, 'No stxAddress defined');

    return new SignInWithStacksMessage({
      domain: this.appDetails.name,
      address: this.stxAddress,
      statement: 'Sign in with Stacks',
      uri: domain ?? typeof document !== 'undefined' ? window.location.origin : '',
      version,
      chainId: ChainID.Mainnet,
      nonce,
    });
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign transactions
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signTransaction: SignTransactionRequest = async (type, params) => {
    invariantWithMessage(!!this.provider, 'No StacksProvider found');
    invariantWithMessage(this.appDetails, 'No AppDetails defined');
    invariantWithMessage(this.account, 'No session active');
    invariantWithMessage(this.stxAddress, 'No session active');

    this.setIsLoading(StatusKeys.TransactionSigning);

    let result: FinishedTxData | undefined;

    const sharedParams = {
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
      postConditionMode: params.postConditionMode,
      postConditions: params.postConditions,
      attachment: params.attachment,
      sponsored: params.sponsored,
    };

    const fn =
      type === TxType.TokenTransfer
        ? makeStxTransferToken
        : type === TxType.ContractCall
        ? makeContractCallToken
        : makeContractDeployToken;

    // todo: types would be great
    // Jenna help?
    const token = await fn({ ...sharedParams, ...params } as any);

    invariantWithMessage(token, 'Transaction token could not be created');

    await openTransactionPopup({
      token,
      onFinish: payload => {
        result = payload;
        params?.onFinish?.(payload);
        this.setIsIdle(StatusKeys.TransactionSigning);
      },
      onCancel: error => {
        params?.onCancel?.(error);
        this.setIsIdle(StatusKeys.TransactionSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign message
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signMessage = async (params: SignedOptionsWithOnHandlers<{ message: string }>) => {
    invariantWithMessage(!!this.provider, 'No StacksProvider found');
    invariantWithMessage(this.appDetails, 'No AppDetails defined');
    invariantWithMessage(this.account, 'No session active');
    invariantWithMessage(this.account?.appPrivateKey, 'No private key found');
    invariantWithMessage(this.stxAddress, 'No session active');
    invariantWithMessage(params.message, 'Must pass message to sign');

    this.setIsLoading(StatusKeys.MessageSigning);
    let result: SignatureData | undefined;

    await handleSignMessageRequest({
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
      message: params.message,
      onFinish: payload => {
        result = payload;
        params?.onFinish?.(payload);
        this.setIsIdle(StatusKeys.MessageSigning);
      },
      onCancel: errorMessage => {
        params?.onCancel?.(errorMessage);
        this.setIsIdle(StatusKeys.MessageSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Sign structured message
   *  ------------------------------------------------------------------------------------------------------------------
   */

  signStructuredMessage = async (
    params: SignedOptionsWithOnHandlers<{
      message: string | ClarityValue;
      domain?: {
        name?: string;
        version?: string;
        chainId?: ChainID;
      };
    }>
  ) => {
    invariantWithMessage(!!this.provider, 'No StacksProvider found');
    invariantWithMessage(this.appDetails, 'No AppDetails defined');
    invariantWithMessage(this.account, 'No session active');
    invariantWithMessage(this.account?.appPrivateKey, 'No private key found');
    invariantWithMessage(this.stxAddress, 'No stxAddress available');
    invariantWithMessage(params.message, 'Must pass message to sign');

    this.setIsLoading(StatusKeys.MessageSigning);
    let result: SignatureData | undefined;

    await handleSignStructuredDataRequest({
      appDetails: this.appDetails,
      privateKey: this.account.appPrivateKey,
      stxAddress: this.stxAddress,
      network: this.network,
      domain: {
        name: params.domain?.name ?? this.appDetails.name,
        version: params.domain?.version ?? '1.0.0',
        chainId: params.domain?.chainId ?? this.network.chainId,
      },
      message: params.message,
      onFinish: payload => {
        result = payload;
        this.setIsIdle(StatusKeys.MessageSigning);
      },
      onCancel: () => {
        this.setIsIdle(StatusKeys.MessageSigning);
      },
    });

    return result;
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Set network
   *  ------------------------------------------------------------------------------------------------------------------
   */
  setNetwork = (network: 'mainnet' | 'testnet' | StacksNetwork) => {
    if (typeof network === 'string')
      this.setState(s => ({
        ...s,
        network: network === 'mainnet' ? new StacksMainnet() : new StacksTestnet(),
      }));
    else this.setState(s => ({ ...s, network }));
  };

  /** ------------------------------------------------------------------------------------------------------------------
   *   Storage
   *  ------------------------------------------------------------------------------------------------------------------
   */

  get gaiaHubConfig() {
    if (!this.hasSession || !this.account.appPrivateKey) return;
    return generateGaiaHubConfigSync({
      gaiaHubUrl: 'https://hub.blockstack.org',
      privateKey: this.account.appPrivateKey,
    });
  }

  putFile = async (
    path: string,
    contents: string | Uint8Array | ArrayBufferView | Blob,
    { encrypt = true, sign }: { encrypt?: boolean; sign?: boolean }
  ) => {
    if (!this.gaiaHubConfig) return;
    if (!this.hasSession) return;
    if (!this.account.appPrivateKey) return;

    return putFile(path, contents, {
      privateKey: this.account.appPrivateKey,
      gaiaHubConfig: this.gaiaHubConfig,
      encrypt,
      sign,
      wasString: typeof contents === 'string',
    });
  };

  getFile = async (
    path: string,
    { decrypt = true, verify }: { decrypt?: boolean; verify?: boolean }
  ) => {
    if (!this.gaiaHubConfig) return;
    if (!this.hasSession) return;
    if (!this.account.appPrivateKey) return;

    return getFile(path, {
      privateKey: this.account.appPrivateKey,
      gaiaHubConfig: this.gaiaHubConfig,
      decrypt,
      verify,
    });
  };
}
