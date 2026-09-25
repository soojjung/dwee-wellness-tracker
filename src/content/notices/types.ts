/**
 * One release note shown on My Page → Notices. Written per app version by the
 * `release-notes-writer` agent (`.claude/agents/release-notes-writer.md`):
 * en first (source), ko as its translation, newest first in both files.
 */
export interface Notice {
  /** Marketing version from package.json `version`, e.g. '1.0.1'. */
  version: string;
  /** List/detail heading, e.g. 'What's new in 1.0.1' / '1.0.1 업데이트 안내'. */
  title: string;
  /** Release date, ISO 'YYYY-MM-DD'. */
  date: string;
  /** Short user-facing bullets, most important first. */
  items: readonly string[];
}
