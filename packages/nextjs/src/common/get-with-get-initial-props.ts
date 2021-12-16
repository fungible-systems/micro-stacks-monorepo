import {
  GetQueries,
  InitialValuesAtomBuilder,
  Queries,
  QueryPropsGetter,
  withInitialQueries,
} from 'jotai-query-toolkit/nextjs';
import { NextPage, NextPageContext } from 'next';
import { formatStacksNetworkCookie, stacksNetworkFromCtx, stacksSessionFromCtx } from './cookies';
import { PartialStacksSession } from './types';

export type GetInitialProps<PageProps> = (
  context: NextPageContext
) => PageProps | Promise<PageProps>;

export interface WithStacksInfo {
  session: PartialStacksSession | null;
  networkUrl: string;
}

export type GetQueriesWithStxInfo<QueryProps> =
  | Queries<QueryProps & WithStacksInfo>
  | GetQueries<QueryProps & WithStacksInfo>;

export interface WithGetInitialProps<QueryProps, T> {
  getQueries: GetQueriesWithStxInfo<QueryProps>;
  getQueryProps?: QueryPropsGetter<QueryProps>;
  getInitialProps?: GetInitialProps<T>;
}

export function getWithGetInitialProps<QueryProps, T>(
  withGetInitialProps: GetQueriesWithStxInfo<QueryProps> | WithGetInitialProps<QueryProps, T>,
  page: NextPage<T>,
  atomBuilders?: InitialValuesAtomBuilder[]
) {
  const getQueries = Array.isArray(withGetInitialProps)
    ? withGetInitialProps
    : 'getQueries' in withGetInitialProps && withGetInitialProps.getQueries;

  return withInitialQueries<QueryProps, T>(page, atomBuilders, async ctx => {
    const serverSideProps =
      ('getInitialProps' in withGetInitialProps &&
        (await withGetInitialProps?.getInitialProps?.(ctx))) ||
      {};
    const session = stacksSessionFromCtx(ctx);
    const network = stacksNetworkFromCtx(ctx);
    return {
      ...session,
      ...serverSideProps,
      stacksNetwork: formatStacksNetworkCookie(network.stacksNetwork),
    } as unknown as T;
  })(getQueries as any, async (ctx, queryClient) => {
    const queryProps =
      ('getQueryProps' in withGetInitialProps &&
        (await withGetInitialProps?.getQueryProps?.(ctx, queryClient))) ||
      {};
    const session = stacksSessionFromCtx(ctx);
    const network = stacksNetworkFromCtx(ctx);
    return {
      session,
      network,
      ...queryProps,
    } as unknown as QueryProps;
  });
}
