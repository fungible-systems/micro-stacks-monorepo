import type { GetNextPageParamFunction } from 'react-query';

interface PartialPageResponse {
  limit: number;
  offset: number;
  total: number;
}

export const getNextPageParam: GetNextPageParamFunction<PartialPageResponse> = lastPage => {
  if (!lastPage) return 0;
  const { limit, offset, total } = lastPage;
  const sum = offset + limit;
  const delta = total - sum;
  const isAtEnd = delta === 0 || Math.sign(delta) === -1;
  if (Math.abs(delta) === sum || isAtEnd) return undefined;
  return sum;
};
