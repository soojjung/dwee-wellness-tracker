import { describe, it, expect, afterEach } from 'vitest';
import { fileToBase64, supportedMediaType } from './fileToBase64';
import type { SupportedImageMediaType } from '@/types';

// ---------------------------------------------------------------------------
// FileReader stub helpers
//
// The vitest environment is 'node' (no DOM). FileReader is a browser-only
// API, so we polyfill global.FileReader per test with a minimal stub that
// synchronously fires onload or onerror. This is not mocking the function
// under test — it is providing the missing browser global.
// ---------------------------------------------------------------------------

type FileReaderStub = {
  result: string | null;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  readAsDataURL: (file: File) => void;
};

function installFileReader(
  behavior: 'load' | 'error',
  fakeDataURL = 'data:image/jpeg;base64,abc123',
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).FileReader = class implements FileReaderStub {
    result: string | null = null;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readAsDataURL(_file: File) {
      if (behavior === 'load') {
        this.result = fakeDataURL;
        this.onload?.();
      } else {
        this.onerror?.();
      }
    }
  };
}

function removeFileReader() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (global as any).FileReader;
}

function makeFile(content: string, name: string, type: string): File {
  return new File([content], name, { type });
}

// ---------------------------------------------------------------------------
// fileToBase64
// ---------------------------------------------------------------------------

describe('fileToBase64', () => {
  afterEach(() => removeFileReader());

  it('strips the data-URL prefix and returns only the base64 payload', async () => {
    installFileReader('load', 'data:image/jpeg;base64,abc123==');
    const file = makeFile('dummy', 'photo.jpg', 'image/jpeg');
    const result = await fileToBase64(file);
    expect(result).toBe('abc123==');
  });

  it('returns the full string when there is no comma (no prefix to strip)', async () => {
    installFileReader('load', 'justbase64noprefixatall');
    const file = makeFile('dummy', 'photo.jpg', 'image/jpeg');
    const result = await fileToBase64(file);
    expect(result).toBe('justbase64noprefixatall');
  });

  it('handles a data-URL whose base64 payload itself contains commas (only first comma is stripped)', async () => {
    installFileReader('load', 'data:image/png;base64,abc,def');
    const file = makeFile('dummy', 'photo.png', 'image/png');
    const result = await fileToBase64(file);
    expect(result).toBe('abc,def');
  });

  it('handles an empty payload after the comma', async () => {
    installFileReader('load', 'data:image/jpeg;base64,');
    const file = makeFile('', 'empty.jpg', 'image/jpeg');
    const result = await fileToBase64(file);
    expect(result).toBe('');
  });

  it('rejects with file_read_failed when FileReader fires onerror', async () => {
    installFileReader('error');
    const file = makeFile('dummy', 'bad.jpg', 'image/jpeg');
    await expect(fileToBase64(file)).rejects.toThrow('file_read_failed');
  });

  it('rejects with file_read_failed when FileReader result is not a string', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).FileReader = class {
      result: null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readAsDataURL(_file: File) {
        // result stays null (non-string) — simulates ArrayBuffer branch
        this.onload?.();
      }
    };
    const file = makeFile('dummy', 'photo.jpg', 'image/jpeg');
    await expect(fileToBase64(file)).rejects.toThrow('file_read_failed');
  });
});

// ---------------------------------------------------------------------------
// supportedMediaType
// ---------------------------------------------------------------------------

describe('supportedMediaType', () => {
  it('returns "image/jpeg" for a JPEG file', () => {
    const file = makeFile('', 'photo.jpg', 'image/jpeg');
    expect(supportedMediaType(file)).toBe<SupportedImageMediaType>('image/jpeg');
  });

  it('returns "image/png" for a PNG file', () => {
    const file = makeFile('', 'image.png', 'image/png');
    expect(supportedMediaType(file)).toBe<SupportedImageMediaType>('image/png');
  });

  it('returns "image/webp" for a WebP file', () => {
    const file = makeFile('', 'image.webp', 'image/webp');
    expect(supportedMediaType(file)).toBe<SupportedImageMediaType>('image/webp');
  });

  it('returns null for an unsupported type (image/gif)', () => {
    const file = makeFile('', 'anim.gif', 'image/gif');
    expect(supportedMediaType(file)).toBeNull();
  });

  it('returns null for a non-image MIME type (application/pdf)', () => {
    const file = makeFile('', 'doc.pdf', 'application/pdf');
    expect(supportedMediaType(file)).toBeNull();
  });

  it('returns null for an empty MIME type string', () => {
    const file = makeFile('', 'noext', '');
    expect(supportedMediaType(file)).toBeNull();
  });

  it('returns null for a MIME type that only partially matches (image/jpeg2000)', () => {
    const file = makeFile('', 'photo.jp2', 'image/jpeg2000');
    expect(supportedMediaType(file)).toBeNull();
  });
});
