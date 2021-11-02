import { AtomWithInfiniteQueryOptions } from 'jotai-query-toolkit';

export type WithLimit<T> = T & { limit?: number };
export type WithHeight<T> = T & { height?: number };
export type InfiniteOptionsWithLimit<T> = WithLimit<AtomWithInfiniteQueryOptions<T>>;
export type InfiniteOptionsLimitHeight<T> = WithHeight<WithLimit<AtomWithInfiniteQueryOptions<T>>>;
