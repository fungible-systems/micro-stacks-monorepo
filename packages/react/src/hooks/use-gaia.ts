import { useAsync, useAsyncCallback } from 'react-async-hook';
import { useMicroStacksClient } from './use-client';
import { useCallback } from 'react';

interface UseGetFileOptions<T> {
  decrypt?: boolean;
  verify?: boolean;
  deserialize?: (value: string | Uint8Array) => T;
}

export const useGetFile = <T = unknown>(filename: string, options?: UseGetFileOptions<T>) => {
  const client = useMicroStacksClient();

  const getFileCallback = useCallback(async (): Promise<T | string | Uint8Array | null> => {
    const file = await client.getFile(filename, {
      decrypt: options?.decrypt,
      verify: options?.verify,
    });
    if (!file) return null;
    if (options?.deserialize) return options.deserialize(file);
    return file;
  }, [client, options]);

  const {
    result: data,
    loading: isLoading,
    error,
  } = useAsync<T | string | Uint8Array | null>(getFileCallback, [options]);

  return { data, isLoading, hasError: !!error, error };
};

interface UsePutFileOptions<T> {
  encrypt?: boolean;
  sign?: boolean;
  serialize?: (value: T) => string | Uint8Array;
  onSuccess?: (path: string | null) => void;
  onError?: (error: Error) => void;
}

export const usePutFile = <T = unknown>(
  filename: string,
  contents: T,
  options?: UsePutFileOptions<T>
) => {
  const client = useMicroStacksClient();

  const serialize = options?.serialize ?? JSON.stringify;

  const putFileCallback = useCallback(async (): Promise<string | null> => {
    const path = await client.putFile(filename, serialize(contents), {
      encrypt: options?.encrypt,
      sign: options?.sign,
    });
    return path ?? null;
  }, [client, options]);

  const {
    loading: isLoading,
    result: data,
    error,
    execute,
  } = useAsyncCallback<string | null>(putFileCallback, {
    onSuccess: useCallback(v => options?.onSuccess?.(v), [options?.onSuccess]),
    onError: useCallback(e => options?.onError?.(e), [options?.onError]),
  });

  return {
    data,
    isLoading,
    hasError: !!error,
    error,
    putFile: useCallback(async () => execute(), [execute]),
  };
};
