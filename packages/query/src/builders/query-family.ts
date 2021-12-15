import merge from 'just-merge';
import { useMemo } from 'use-memo-one';
import { Memoize } from 'typescript-memoize';
import { hashQueryKey } from 'react-query';
import { atomFamilyWithQuery, makeQueryKey, useQueryAtom } from 'jotai-query-toolkit';
import type { Query } from '@common/types';
import type { QueryFamilyBuilderBase } from '@common/queries/builders/base';
import type { QueryAtomFamilyReturn } from '@common/queries/builders/types';
import type { AtomWithQueryOptions } from 'jotai-query-toolkit';
import type { QueryKey } from 'react-query';

export class QueryFamilyBuilder<Params extends object, Data>
  implements
    QueryFamilyBuilderBase<
      Params,
      Data,
      AtomWithQueryOptions<Data>,
      QueryAtomFamilyReturn<Params, Data>
    >
{
  constructor(
    key: QueryFamilyBuilderBase<Params, Data>['key'],
    fetcher: QueryFamilyBuilderBase<Params, Data>['_fetcher'],
    options?: QueryFamilyBuilderBase<Params, Data>['options'],
    defaultParams?: QueryFamilyBuilderBase<Params, Data>['defaultParams']
  ) {
    this.key = key;
    this._fetcher = fetcher;
    this.options = options;
    this.defaultParams = defaultParams;
  }

  readonly key;
  readonly _fetcher;
  readonly options;
  public readonly defaultParams;
  cache = new WeakMap();

  @Memoize(hashQueryKey)
  public getKey(params?: Params): QueryKey {
    if (typeof this.key === 'function') return this.key(params);
    return makeQueryKey(this.key, [params]);
  }

  @Memoize(hashQueryKey)
  public paramsBuilder(params?: Params): Params {
    if (!params) return this.defaultParams;
    return this.defaultParams ? (merge(this.defaultParams, params) as Params) : params;
  }

  getCached(params: any) {
    const key = this.getKey(params);
    const match = this.cache.get(key as object);
    if (match) return match;
  }

  setCached(params: any, item: any) {
    const key = this.getKey(params);
    return this.cache.set(key as object, item);
  }

  public async fetcher(_params?: Params) {
    const params = this.paramsBuilder(_params);
    const makeFetcher = this._fetcher(params);
    if (typeof makeFetcher === 'function') return makeFetcher();
    return makeFetcher;
  }

  public query(params?: Params): Query<Data> {
    const _params = this.paramsBuilder(params);
    const queryKey =
      typeof this.key === 'function' ? this.key(_params) : makeQueryKey(this.key, [_params]);
    return [queryKey, async () => this.fetcher(_params)];
  }

  public get atom() {
    return (params: Params) => {
      const match = this.getCached(params);
      if (match) return match;
      const anAtom = atomFamilyWithQuery<Params, Data>(
        (_get, _params) => this.getKey(_params),
        (_get, _params) => this.query(this.paramsBuilder(_params))[1](),
        this.options
      )(params);
      this.setCached(params, anAtom);
      return anAtom;
    };
  }

  public hook(params: Params = this.defaultParams) {
    const anAtom = useMemo(() => this.atom(this.paramsBuilder(params)), [params]);
    return useQueryAtom<Data>(anAtom);
  }
}
