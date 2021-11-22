import {
  formatStacksNetworkCookie,
  stacksNetworkFromCtx,
  stacksSessionFromCtx,
} from '../common/cookies';
import { getServerSideQueryProps, Queries, Query } from 'jotai-query-toolkit/nextjs';
import { GetServerSideProps, GetServerSidePropsContext, NextPageContext } from 'next';
import { QueriesLiteral, queryMap } from '../common/query-map';
import { PartialStacksSession } from '../common/types';

type GetQueriesFromServerSideProps = (params: {
  ctx: NextPageContext | GetServerSidePropsContext;
  session: PartialStacksSession | null;
  networkUrl: string;
}) => Queries | null | Promise<Queries | null>;

const getBuiltInQuery = (
  query: QueriesLiteral,
  {
    session,
    networkUrl = 'https://stacks-node-api.mainnet.stacks.co',
  }: { session: PartialStacksSession | null; networkUrl?: string }
): Queries[number] | undefined => {
  const match = query in queryMap;
  if (match && session) return queryMap[query](session, networkUrl);
  return;
};

export const makeGetServerSideProps = (
  queries: (QueriesLiteral | GetQueriesFromServerSideProps | Query)[],
  getServerSideProps?: GetServerSideProps
) => {
  return getServerSideQueryProps(async context => {
    const session = stacksSessionFromCtx(context).partialStacksSession;
    const network = stacksNetworkFromCtx(context).stacksNetwork;
    const ctx = context as NextPageContext | GetServerSidePropsContext;

    const builtIn = queries.filter(item => typeof item === 'string') as QueriesLiteral[];

    const custom = queries.filter(
      item => typeof item === 'function'
    ) as GetQueriesFromServerSideProps[];

    const final: Queries = queries.filter(
      item => Array.isArray(item) && item.length === 2
    ) as Query[];

    const builtInQueries = builtIn
      .map(item => getBuiltInQuery(item, { session, networkUrl: network?.getCoreApiUrl() }))
      .filter(Boolean) as Queries;

    await Promise.all(
      custom.map(async queryBuilder => {
        const q = await queryBuilder({
          ctx,
          session,
          networkUrl: network?.getCoreApiUrl(),
        });
        if (q?.length) final.push(...q);
      })
    );

    final.push(...builtInQueries);

    return final;
  })(async context => {
    const serverSideProps = (await getServerSideProps?.(context)) || { props: {} };
    const session = stacksSessionFromCtx(context);
    const network = stacksNetworkFromCtx(context);

    const props = {
      ...session,
      ...('props' in serverSideProps ? serverSideProps.props : {}),
      stacksNetwork: formatStacksNetworkCookie(network.stacksNetwork),
    };
    return {
      props,
    };
  });
};
