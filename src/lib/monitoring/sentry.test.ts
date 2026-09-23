import { describe, it, expect, vi } from 'vitest';

vi.mock('@sentry/capacitor', () => ({ init: vi.fn() }));
vi.mock('@sentry/react', () => ({ init: vi.fn(), captureException: vi.fn() }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' },
}));

import { scrubEvent } from './sentry';

// Mirrors the function's own parameter type without importing Sentry's types.
type ErrorEvent = Parameters<typeof scrubEvent>[0];

// Test fixtures only ever need the fields scrubEvent reads/writes — the real
// ErrorEvent type has many more required fields we don't care about here.
function ev(partial: Record<string, unknown>): ErrorEvent {
  return partial as unknown as ErrorEvent;
}

describe('scrubEvent', () => {
  it('removes event.user even when present', () => {
    const event = ev({ user: { id: 'u1', email: 'a@b.com' } });
    const result = scrubEvent(event);
    expect(result.user).toBeUndefined();
  });

  it('keeps only the path of request.url and deletes cookies/headers/query_string', () => {
    const event = ev({
      request: {
        url: 'https://dwee-neon.vercel.app/auth/callback/?code=abc#access_token=xyz&refresh_token=r',
        cookies: 'session=abc',
        headers: { Authorization: 'Bearer abc' },
        query_string: 'code=abc',
      },
    });

    const result = scrubEvent(event);

    expect(result.request?.url).toBe('https://dwee-neon.vercel.app/auth/callback/');
    expect(result.request?.cookies).toBeUndefined();
    expect(result.request?.headers).toBeUndefined();
    expect(result.request?.query_string).toBeUndefined();
  });

  it('replaces an email address in message with [email]', () => {
    const event = ev({ message: 'Failed to sync for user a@b.com' });
    const result = scrubEvent(event);
    expect(result.message).toBe('Failed to sync for user [email]');
  });

  it('filters a token value in message while keeping the key', () => {
    const event = ev({
      message:
        'redirected to /auth/callback/?code=abc#access_token=xyz&refresh_token=r&id_token=zzz',
    });
    const result = scrubEvent(event);
    expect(result.message).toBe(
      'redirected to /auth/callback/?code=[filtered]#access_token=[filtered]&refresh_token=[filtered]&id_token=[filtered]',
    );
  });

  it('scrubs exception.values[n].value the same way message is scrubbed', () => {
    const event = ev({
      exception: {
        values: [
          {
            type: 'Error',
            value: 'reported by a@b.com, url had ?access_token=xyz&refresh_token=abc',
          },
          { type: 'Error' },
        ],
      },
    });

    const result = scrubEvent(event);

    expect(result.exception?.values?.[0]?.value).toBe(
      'reported by [email], url had ?access_token=[filtered]&refresh_token=[filtered]',
    );
    expect(result.exception?.values?.[1]?.value).toBeUndefined();
  });

  it('drops console breadcrumbs entirely', () => {
    const event = ev({
      breadcrumbs: [
        { category: 'console', message: 'debug log' },
        { category: 'navigation', message: 'ok' },
      ],
    });

    const result = scrubEvent(event);

    expect(result.breadcrumbs?.map((b) => b.category)).toEqual(['navigation']);
  });

  it('keeps non-console breadcrumb category and scrubs its data.url/from/to', () => {
    const event = ev({
      breadcrumbs: [
        {
          category: 'navigation',
          data: {
            url: 'https://dwee-neon.vercel.app/auth/callback/?code=abc#access_token=xyz',
            from: 'https://dwee-neon.vercel.app/login?code=abc',
            to: 'https://dwee-neon.vercel.app/home?ref=x',
            method: 'GET',
          },
        },
      ],
    });

    const result = scrubEvent(event);

    expect(result.breadcrumbs?.[0]?.category).toBe('navigation');
    expect(result.breadcrumbs?.[0]?.data?.url).toBe('https://dwee-neon.vercel.app/auth/callback/');
    expect(result.breadcrumbs?.[0]?.data?.from).toBe('https://dwee-neon.vercel.app/login');
    expect(result.breadcrumbs?.[0]?.data?.to).toBe('https://dwee-neon.vercel.app/home');
    expect(result.breadcrumbs?.[0]?.data?.method).toBe('GET');
  });

  it('scrubs breadcrumb.message the same way', () => {
    const event = ev({
      breadcrumbs: [{ category: 'navigation', message: 'signed in as a@b.com' }],
    });

    const result = scrubEvent(event);

    expect(result.breadcrumbs?.[0]?.message).toBe('signed in as [email]');
  });

  it('passes an event with none of the scrubbed fields through unchanged', () => {
    const event = ev({ level: 'error', tags: { platform: 'web' } });
    const result = scrubEvent(event);
    expect(result).toBe(event);
    expect(result.breadcrumbs).toBeUndefined();
  });

  it('leaves request.url undefined when it was undefined', () => {
    const event = ev({ request: { cookies: 'session=abc' } });
    const result = scrubEvent(event);
    expect(result.request?.url).toBeUndefined();
  });
});
