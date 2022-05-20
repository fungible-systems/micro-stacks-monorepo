import {
  hashMessage as _hashMessage,
  verifySignedMessage as _verifySignedMessage,
} from 'micro-stacks/connect';
import { useCallback } from 'react';

export const useVerifyMessage = () => {
  const hashMessage = useCallback(_hashMessage, []);
  const verifySignedMessage = useCallback((message: string, signature: string) => {
    return _verifySignedMessage(hashMessage(message), signature);
  }, []);

  return {
    hashMessage,
    verifySignedMessage,
  };
};
