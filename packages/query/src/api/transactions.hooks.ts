import { useInfiniteQueryAtom } from 'jotai-query-toolkit';
import { useCurrentNetworkUrl, DEFAULT_LIST_LIMIT } from '@micro-stacks/react';
import { transactionClient, transactionsListClient } from './transactions.atoms';

import type { TransactionResults, TransactionType } from '@stacks/stacks-blockchain-api-types';
import type { AtomWithInfiniteQueryOptions } from 'jotai-query-toolkit';
import type { WithLimit } from '../common/types';

import { useAtom } from 'jotai';

/**
 * Gets a list of confirmed transaction
 * This uses the currently selected network url
 * @param options -- pass custom options to the query atom, {@link AtomWithInfiniteQueryOptions}
 */
export function useTransactionListClient(
  options: WithLimit<AtomWithInfiniteQueryOptions<TransactionResults>> & {
    type?: TransactionType | TransactionType[];
  } = {}
) {
  const networkUrl = useCurrentNetworkUrl();
  const atom = transactionsListClient([
    networkUrl,
    options.limit || DEFAULT_LIST_LIMIT,
    options.type,
  ]);
  return useInfiniteQueryAtom(atom);
}

/**
 * Get a specific transaction by tx_id
 * This uses the currently selected network url
 * @param txid - the principal you're interested in
 * @param options -- pass custom options to the query atom, {@link AtomWithQueryOptions}
 */
export function useTransactionClient(txid: string) {
  const networkUrl = useCurrentNetworkUrl();
  return useAtom(transactionClient([networkUrl, txid]));
}
