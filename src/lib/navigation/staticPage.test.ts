import { describe, expect, it } from 'vitest';
import { staticPagePath, stripIndexHtml } from './staticPage';

describe('staticPagePath', () => {
  it('maps the root to /index.html', () => {
    expect(staticPagePath('/')).toBe('/index.html');
  });

  it('adds the slash and index.html to a tab path', () => {
    expect(staticPagePath('/log')).toBe('/log/index.html');
  });

  it('keeps an existing trailing slash', () => {
    expect(staticPagePath('/magazine/')).toBe('/magazine/index.html');
  });
});

describe('stripIndexHtml', () => {
  it('strips index.html from the root', () => {
    expect(stripIndexHtml('/index.html')).toBe('/');
  });

  it('strips index.html from a nested path, keeping the trailing slash', () => {
    expect(stripIndexHtml('/log/index.html')).toBe('/log/');
  });

  it('returns null for a normal address', () => {
    expect(stripIndexHtml('/log/')).toBeNull();
  });

  it('ignores a file merely ending in index.html', () => {
    expect(stripIndexHtml('/foo-index.html')).toBeNull();
  });
});
