import { InitialValuesAtomBuilder, withInitialQueryData } from 'jotai-query-toolkit/nextjs';
import type { AppProviderAtomBuilder } from '@micro-stacks/react';
import type { NextPage } from 'next';
import {
  GetQueriesWithStxInfo,
  getWithGetInitialProps,
  WithGetInitialProps,
} from './common/get-with-get-initial-props';
import { getAtomBuilders } from './common/get-atom-builders';

export function wrapWithMicroStacks<T, QueryProps extends object = any>(
  options: AppProviderAtomBuilder
) {
  return function Wrapper(
    page: NextPage<T>,
    initialValuesAtomBuilders?: InitialValuesAtomBuilder[],
    withGetInitialProps?: GetQueriesWithStxInfo<QueryProps> | WithGetInitialProps<QueryProps, T>
  ) {
    const atomBuilders = getAtomBuilders(options, initialValuesAtomBuilders || []);
    if (withGetInitialProps) return getWithGetInitialProps(withGetInitialProps, page, atomBuilders);
    return withInitialQueryData(page, atomBuilders);
  };
}
