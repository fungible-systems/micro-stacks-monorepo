import { QueryKey } from 'react-query';
import { AtomWithQueryOptions, UseQueryAtomBaseExtras } from 'jotai-query-toolkit';
import { WritableAtom } from 'jotai';

export interface QueryBuilderBase<Data> {
  readonly key: QueryKey;
  readonly fetcher: () => Promise<Data>;
  readonly options?: AtomWithQueryOptions<Data>;
  cache: WeakMap<object, any>;

  query(): Query<Data>;

  getCached(deps: object): any;

  setCached(deps: object, item: any): any;

  get atom(): WritableAtom<Data, JQTAtomWithQueryActions<Data>, void>;

  hook(): [Data extends Promise<infer V> ? V : Data, UseQueryAtomBaseExtras<Data>];
}

export interface QueryFamilyBuilderBase<
  Params,
  Data,
  Options = AtomWithQueryOptions<Data>,
  AtomReturnValue = WritableAtom<Data, JQTAtomWithQueryActions<Data>, void>,
  HookReturnValue = [Data extends Promise<infer V> ? V : Data, UseQueryAtomBaseExtras<Data>]
> {
  readonly key: ((param: Params) => string | QueryKey) | string | QueryKey;
  readonly _fetcher:
    | ((params: Params) => Promise<Data>)
    | ((params: Params) => () => Promise<Data>);
  readonly options?: Options;
  readonly defaultParams?: Params;
  cache: WeakMap<object, any>;

  getKey(params?: Params): QueryKey;

  paramsBuilder(params?: Params): Params;

  getCached(deps: object): any;

  setCached(deps: object, item: any): any;

  fetcher(_params?: Params): Promise<Data>;

  query(): Query<Data>;

  get atom(): AtomReturnValue;

  hook(params?: Params): HookReturnValue;
}
