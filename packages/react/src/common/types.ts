// https://github.com/sindresorhus/type-fest
import { AuthOptions } from 'micro-stacks/connect';
import { StacksNetwork } from 'micro-stacks/network';

export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
  ObjectType,
  Exclude<keyof ObjectType, KeysType>
>;
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };
export type SetOptional<BaseType, Keys extends keyof BaseType> = Simplify<
  // Pick just the keys that are readonly from the base type.
  Except<BaseType, Keys> &
    // Pick the keys that should be mutable from the base type and make them mutable.
    Partial<Pick<BaseType, Keys>>
>;

export type NetworkType = StacksNetwork | 'mainnet' | 'testnet' | 'mocknet';

export interface AppProviderAtomBuilder {
  /** Web wallet authOptions */
  authOptions: AuthOptions;
  /** the network for the app (testnet | mainnet) */
  network?: StacksNetwork | 'mainnet' | 'testnet';
  useCookies?: boolean;
  partialStacksSession?: {
    addresses: {
      mainnet: string;
      testnet: string;
    };
    identityAddress: string;
    profile_url: string;
    hubUrl: string;
  };
}
