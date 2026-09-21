import { describe, it, expect } from 'vitest';
import { errorMessage } from './errorMessage';

describe('errorMessage', () => {
  it('returns the message from a native Error instance', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns the message from an Error subclass instance', () => {
    expect(errorMessage(new TypeError('nope'))).toBe('nope');
  });

  it('returns the message property from a plain object shaped like an Error', () => {
    expect(errorMessage({ message: 'custom failure' })).toBe('custom failure');
  });

  it('returns undefined when the object has no message property', () => {
    expect(errorMessage({})).toBeUndefined();
  });

  it('returns undefined when called with a string primitive', () => {
    expect(errorMessage('plain string')).toBeUndefined();
  });

  it('throws when called with null', () => {
    expect(() => errorMessage(null)).toThrow();
  });

  it('throws when called with undefined', () => {
    expect(() => errorMessage(undefined)).toThrow();
  });
});
