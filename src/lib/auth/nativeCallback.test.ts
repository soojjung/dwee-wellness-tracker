import { describe, it, expect } from 'vitest';
import { isNativeAuthCallback, toWebCallbackPath, NATIVE_AUTH_REDIRECT } from './nativeCallback';

describe('isNativeAuthCallback', () => {
  it('accepts the bare redirect', () => {
    expect(isNativeAuthCallback(NATIVE_AUTH_REDIRECT)).toBe(true);
  });
  it('accepts query, hash and trailing-slash variants', () => {
    expect(isNativeAuthCallback('dwee://auth/callback?code=1')).toBe(true);
    expect(isNativeAuthCallback('dwee://auth/callback#access_token=t')).toBe(true);
    expect(isNativeAuthCallback('dwee://auth/callback/?code=1')).toBe(true);
  });
  it('rejects other deep links and look-alike prefixes', () => {
    expect(isNativeAuthCallback('dwee://magazine')).toBe(false);
    expect(isNativeAuthCallback('dwee://auth/callbackx')).toBe(false);
    expect(isNativeAuthCallback('https://dwee-neon.vercel.app/auth/callback?code=1')).toBe(false);
  });
});

describe('toWebCallbackPath', () => {
  it('forwards a PKCE code query', () => {
    expect(toWebCallbackPath('dwee://auth/callback?code=abc')).toBe('/auth/callback/?code=abc');
  });
  it('forwards an implicit-flow hash', () => {
    expect(toWebCallbackPath('dwee://auth/callback#access_token=t&refresh_token=r')).toBe(
      '/auth/callback/#access_token=t&refresh_token=r',
    );
  });
  it('keeps query and hash together, in order', () => {
    expect(toWebCallbackPath('dwee://auth/callback?code=abc#x=y')).toBe(
      '/auth/callback/?code=abc#x=y',
    );
  });
  it('drops a trailing slash before the query', () => {
    expect(toWebCallbackPath('dwee://auth/callback/?code=abc')).toBe('/auth/callback/?code=abc');
  });
  it('returns the bare page for a redirect with no params', () => {
    expect(toWebCallbackPath(NATIVE_AUTH_REDIRECT)).toBe('/auth/callback/');
  });
  it('returns null for a non-callback URL', () => {
    expect(toWebCallbackPath('dwee://magazine')).toBeNull();
  });
});
