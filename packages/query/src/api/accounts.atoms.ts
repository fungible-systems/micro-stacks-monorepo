import { atomFamilyWithInfiniteQuery, atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchAccountAssets,
  fetchAccountBalances,
  fetchAccountMempoolTransactions,
  fetchAccountStxBalance,
  fetchAccountTransactions,
  fetchAccountTransactionsWithTransfers,
  getNextPageParam,
} from 'micro-stacks/api';
import { AccountClientKeys } from './accounts.keys';

import type {
  PrincipalWithNetwork,
  PrincipalListWithNetwork,
  PrincipalListHeightWithNetwork,
} from 'micro-stacks/api';

import { DEFAULT_LIST_LIMIT } from '@micro-stacks/react';

import type {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';

export const accountBalancesClientAtom = atomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressBalanceResponse
>(AccountClientKeys.Balances, function queryFn(_get, [principal, url]) {
  return fetchAccountBalances({ url, principal });
});

export const accountStxBalanceClientAtom = atomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressStxBalanceResponse
>(AccountClientKeys.StxBalance, function queryFn(_get, [principal, url]) {
  return fetchAccountStxBalance({ url, principal });
});

export const accountTransactionsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsListResponse
>(
  AccountClientKeys.Transactions,
  function queryFn(_get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactions({ principal, limit, height, url, offset });
  },
  {
    getNextPageParam,
  }
);

export const accountTransactionsListWithTransfersClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsWithTransfersListResponse
>(
  AccountClientKeys.TransactionsWithTransfers,
  function queryFn(_get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactionsWithTransfers({
      principal,
      limit,
      offset,
      url,
      height,
    });
  },
  {
    getNextPageParam,
  }
);

export const accountAssetsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  AddressAssetsListResponse
>(
  AccountClientKeys.Assets,
  function queryFn(_get, [principal, limit = DEFAULT_LIST_LIMIT, url], { pageParam: offset = 0 }) {
    return fetchAccountAssets({
      url,
      limit,
      principal,
      offset,
    });
  },
  {
    getNextPageParam,
  }
);

export const accountMempoolTransactionsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  MempoolTransactionListResponse
>(
  AccountClientKeys.PendingTransactions,
  function queryFn(_get, [principal, limit = DEFAULT_LIST_LIMIT, url], { pageParam: offset = 0 }) {
    return fetchAccountMempoolTransactions({
      limit,
      offset,
      url,
      principal,
    });
  },
  {
    getNextPageParam,
  }
);
