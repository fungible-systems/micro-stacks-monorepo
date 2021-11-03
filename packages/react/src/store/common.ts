import { atomFamily, atomWithDefault } from 'jotai/utils';

export const loadingStateAtom = (initialValue = false) =>
  atomFamily<string, boolean, boolean>(_key => atomWithDefault<boolean>(() => initialValue));
