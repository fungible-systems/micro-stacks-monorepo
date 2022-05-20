import { useCallback } from 'react';
import {
  hashMessage as _hashMessage,
  verifyMessageSignature as _verifyMessageSignature,
} from 'micro-stacks/connect';

export const useVerifyMessage = () => {
  const hashMessage = useCallback(_hashMessage, []);
  const verifyMessageSignature = useCallback(
    (message: string, signature: string, publicKey?: string) => {
      return _verifyMessageSignature({
        message,
        signature,
        publicKey,
      });
    },
    []
  );

  return {
    hashMessage,
    verifyMessageSignature,
  };
};
