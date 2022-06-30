import { getClient } from '@micro-stacks/client';
import {writable} from 'svelte/store'


export const MicroStacksClientStore = writable<ReturnType<typeof getClient> | null>()



export {}
