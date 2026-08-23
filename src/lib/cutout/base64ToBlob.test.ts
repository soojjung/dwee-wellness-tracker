import { describe, expect, it } from 'vitest';
import { base64ToBlob } from './base64ToBlob';

describe('base64ToBlob', () => {
  it('reconstructs the original bytes', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG magic
    const base64 = btoa(String.fromCharCode(...bytes));
    const blob = base64ToBlob(base64, 'image/png');
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBe(bytes.length);
    const roundtrip = new Uint8Array(await blob.arrayBuffer());
    expect(Array.from(roundtrip)).toEqual(Array.from(bytes));
  });

  it('handles empty payloads', async () => {
    const blob = base64ToBlob('', 'image/png');
    expect(blob.size).toBe(0);
    expect(blob.type).toBe('image/png');
  });

  it('applies the given media type', () => {
    const blob = base64ToBlob(btoa('x'), 'image/webp');
    expect(blob.type).toBe('image/webp');
  });
});
