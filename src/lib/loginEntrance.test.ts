import { afterEach, describe, expect, it } from 'vitest';
import { consumeLoginEntrance, queueLoginEntrance } from './loginEntrance';

// Module-scoped one-shot queue (same pattern as appToast). Drain any pending
// signal after each test so state never leaks across tests regardless of
// assertion order within this file.
afterEach(() => {
  consumeLoginEntrance();
});

describe('consumeLoginEntrance', () => {
  it('returns false when nothing was queued', () => {
    expect(consumeLoginEntrance()).toBe(false);
  });

  it('returns true once after queueLoginEntrance was called', () => {
    queueLoginEntrance();
    expect(consumeLoginEntrance()).toBe(true);
  });

  it('returns false on a second consume after being drained', () => {
    queueLoginEntrance();
    consumeLoginEntrance();
    expect(consumeLoginEntrance()).toBe(false);
  });

  it('collapses duplicate queueLoginEntrance calls into a single consume', () => {
    queueLoginEntrance();
    queueLoginEntrance();
    expect(consumeLoginEntrance()).toBe(true);
    expect(consumeLoginEntrance()).toBe(false);
  });
});
