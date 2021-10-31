import type { GetServerSidePropsContext, GetStaticPropsContext, NextPageContext } from 'next';
import { StacksSessionState } from 'micro-stacks/connect';
import nookies, { destroyCookie, setCookie } from 'nookies';
import { PartialStacksSession, SessionCookie } from './types';
import { StacksNetwork } from 'micro-stacks/network';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';


function formatStacksNetworkCookie(payload: StacksNetwork) {
  return [payload.getCoreApiUrl(), payload.chainId];
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

export function getStacksSessionFromCookies(ctx: GetServerSidePropsContext | NextPageContext) {
  return nookies.get(ctx)?.StacksSessionState;
}
export function getStacksNetworkFromCookies(ctx: GetServerSidePropsContext | NextPageContext) {
  return nookies.get(ctx)?.StacksNetwork;
}

export function stacksSessionFromCtx(
  ctx: GetServerSidePropsContext | NextPageContext | GetStaticPropsContext
) {
  if ('preview' in ctx) {
    console.warn('GetStaticPropsContext cannot be passed to stacksSessionFromCtx');
    return { partialStacksSession: null };
  }
  const partialStacksSession = parseSessionCookie(
    getStacksSessionFromCookies(ctx as GetServerSidePropsContext | NextPageContext)
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
    return { partialStacksSession: null };
  }
  const partialStacksSession = parseSessionCookie(
    getStacksSessionFromCookies(ctx as GetServerSidePropsContext | NextPageContext)
  );
  return {
    partialStacksSession,
    isSignedIn: !!partialStacksSession,
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
  const { get, set } = cookies();
  const anAtom = atomWithStorage<string | undefined>(key, value, {
    getItem: get,
    setItem: (key, newValue) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      set(key, newValue as any, {});
    },
  });
  cookieMap.set(key, anAtom);
  return anAtom;
};

export function cookies() {
  const doc = typeof document === 'undefined' ? { cookie: '' } : document;

  function get(key: string) {
    const splat = doc.cookie.split(/;\s*/);
    for (let i = 0; i < splat.length; i++) {
      const ps = splat[i].split('=');
      const k = unescape(ps[0]);
      if (k === key) return unescape(ps[1]);
    }
    return undefined;
  }

  function set(key: string, value: string, opts?: any) {
    if (!opts) opts = {};
    let s = escape(key) + '=' + escape(value);
    if (opts.expires) s += '; expires=' + opts.expires;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (opts.path) s += '; path=' + escape(opts.path);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (opts.domain) s += '; domain=' + escape(opts.domain);
    if (opts.secure) s += '; secure';
    doc.cookie = s;
    return s;
  }

  return {
    set,
    get,
  };
}
