import { useContext } from 'react';
import { MicroStacksClientContext } from '../common/context';
import type { Client } from '@micro-stacks/core';

export const useMicroStacksClient = () => useContext<Client>(MicroStacksClientContext);
