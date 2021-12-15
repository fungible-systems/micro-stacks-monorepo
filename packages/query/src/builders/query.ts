import { hashQueryKey, QueryKey } from 'react-query';
import {
  atomWithQuery,
  AtomWithQueryOptions,
  makeQueryKey,
  useQueryAtom,
} from 'jotai-query-toolkit';
import { Query } from '@common/types';
import { Memoize } from 'typescript-memoize';
import { useMemo } from 'use-memo-one';
import { QueryBuilderBase } from '@common/queries/builders/base';

interface QueryBuilderParams<Data> {
  key: string | QueryKey;
  fetcher: () => Promise<Data>;
  options?: AtomWithQueryOptions<Data>;
}

export class QueryBuilder<Data> implements QueryBuilderBase<Data> {
  constructor(
    key: QueryBuilderParams<Data>['key'],
    fetcher: QueryBuilderParams<Data>['fetcher'],
    options?: QueryBuilderParams<Data>['options']
  ) {
    this.key = key;
    this.fetcher = fetcher;
    this.options = options;
  }

  readonly key: QueryBuilderParams<Data>['key'];
  readonly fetcher: QueryBuilderParams<Data>['fetcher'];
  readonly options?: QueryBuilderParams<Data>['options'];
  cache = new WeakMap();

  public query(): Query<Data> {
    return [makeQueryKey(this.key), this.fetcher];
  }

  getCached(deps: object) {
    const match = this.cache.get(deps as object);
    if (match) return match;
  }

  setCached(deps: object, item: any) {
    return this.cache.set(deps as object, item);
  }

  @Memoize(hashQueryKey)
  public get atom() {
    const anAtom = atomWithQuery<Data>(this.key, this.fetcher, this.options);
    const match = this.getCached(anAtom);
    if (match) return match;
    this.setCached(anAtom, anAtom);
    return anAtom;
  }

  public hook() {
    const anAtom = useMemo(() => this.atom, []);
    return useQueryAtom<Data>(anAtom);
  }
}
