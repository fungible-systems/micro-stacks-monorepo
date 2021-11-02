import type { GetServerSidePropsContext, GetStaticPropsContext, NextPageContext } from 'next';
import { StacksSessionState } from 'micro-stacks/connect';
import { destroyCookie, setCookie, parseCookies } from 'nookies';
import { PartialStacksSession, SessionCookie } from './types';
import { StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { ChainID } from 'micro-stacks/common';

export function formatStacksNetworkCookie(payload: StacksNetwork) {
  return [payload.getCoreApiUrl(), payload.chainId];
}

export function parseNetworkCookie(payload?: string) {
  if (!payload) return new StacksMainnet();
  const [networkUrl, chainId] = JSON.parse(payload);
  if (chainId === ChainID.Testnet) return new StacksTestnet({ url: networkUrl });
  return new StacksMainnet({ url: networkUrl });
}

function formatSessionCookie(payload: StacksSessionState) {
  return [
    payload.addresses.mainnet,
    payload.addresses.testnet,
    payload.identityAddress,
    payload.profile_url,
    payload.hubUrl,
  ];
}

export function parseSessionCookie(payload?: string): PartialStacksSession | null {
  if (!payload) return null;
  const parsed = JSON.parse(payload) as SessionCookie;
  return {
    addresses: {
      mainnet: parsed[0],
      testnet: parsed[1],
    },
    identityAddress: parsed[2],
    profile_url: parsed[3],
    hubUrl: parsed[4],
  };
}

export function getStacksSessionFromCookies(ctx?: GetServerSidePropsContext | NextPageContext) {
  const value = parseCookies(ctx)?.['StacksSessionState'];
  return parseSessionCookie(value);
}

export function getStacksNetworkFromCookies(
  ctx?: GetServerSidePropsContext | NextPageContext
): StacksNetwork {
  const value = parseCookies(ctx)?.['StacksNetwork'];
  return parseNetworkCookie(value);
}

export function stacksSessionFromCtx(
  ctx: GetServerSidePropsContext | NextPageContext | GetStaticPropsContext
) {
  if ('preview' in ctx) {
    console.warn('GetStaticPropsContext cannot be passed to stacksSessionFromCtx');
    return { partialStacksSession: null };
  }
  const partialStacksSession = getStacksSessionFromCookies(
    ctx as GetServerSidePropsContext | NextPageContext
  );
  return {
    partialStacksSession,
    isSignedIn: !!partialStacksSession,
  };
}

export function stacksNetworkFromCtx(
  ctx: GetServerSidePropsContext | NextPageContext | GetStaticPropsContext
) {
  if ('preview' in ctx) {
    console.warn('GetStaticPropsContext cannot be passed to stacksNetworkFromCtx');
    return { stacksNetwork: new StacksMainnet() };
  }
  const stacksNetwork = getStacksNetworkFromCookies(
    ctx as GetServerSidePropsContext | NextPageContext
  );
  return {
    stacksNetwork,
  };
}

export function setSessionCookies(payload: StacksSessionState) {
  setCookie(null, 'StacksSessionState', JSON.stringify(formatSessionCookie(payload)), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function setNetworkCookies(payload: StacksNetwork) {
  setCookie(null, 'StacksNetwork', JSON.stringify(formatStacksNetworkCookie(payload)), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function resetSessionCookies() {
  destroyCookie(null, 'StacksSessionState');
  destroyCookie(null, 'StacksNetwork');
}

const cookieMap = new Map();

export const useCookiesAtom = atom(false);

export const atomWithCookieStorage = (key: string, value: string) => {
  const match = cookieMap.get(key);
  if (match) return match;
  const anAtom = atomWithStorage<string | undefined>(key, value, {
    getItem: key => {
      const cookies = parseCookies();
      return cookies[key];
    },
    setItem: (key, newValue) => {
      if (newValue) setCookie(null, key, newValue);
    },
  });
  cookieMap.set(key, anAtom);
  return anAtom;
};
