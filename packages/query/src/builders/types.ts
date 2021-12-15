import { WritableAtom } from 'jotai';
import { AtomWithInfiniteQueryAction, AtomWithQueryAction } from 'jotai/query';
import { MutateOptions, SetDataOptions } from 'react-query';

export declare type JQTAtomWithQueryActions<Data> =
  | AtomWithQueryAction
  | {
      type: 'setQueryData';
      payload: {
        data: Data;
        options?: SetDataOptions;
      };
    }
  | {
      type: 'mutate';
      payload: MutateOptions<Data>;
    };
declare type AtomFamily<Param, AtomType> = (param: Param) => AtomType;
type QueryFamilyAtomType<P, T, O> = AtomFamily<P, WritableAtom<T | undefined, O>>;
export type InfiniteQueryAtomReturn<P, T> = QueryFamilyAtomType<
  P,
  T,
  AtomWithInfiniteQueryAction<T>
>;
export type QueryAtomFamilyReturn<P, T> = QueryFamilyAtomType<P, T, JQTAtomWithQueryActions<T>>;
