/**
 * Capacitor iOS serves the ROOT index.html for any path without a file
 * extension, so a full reload of `/log/` would boot the home page under the
 * `/log/` address. Loading a tab's exported file directly avoids that; the
 * `index.html` suffix is then stripped from the address on boot.
 */
export function staticPagePath(href: string): string {
  const path = href.endsWith('/') ? href : `${href}/`;
  return `${path}index.html`;
}

/** The address without a trailing `index.html`, or null when there is none. */
export function stripIndexHtml(pathname: string): string | null {
  return pathname.endsWith('/index.html') ? pathname.slice(0, -'index.html'.length) : null;
}
