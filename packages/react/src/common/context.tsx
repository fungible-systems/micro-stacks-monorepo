import { createContext } from 'react';
import { getClient } from '@micro-stacks/core';

export const MicroStacksClientContext = createContext<ReturnType<typeof getClient>>(getClient());
