export interface BookmarkRepository {
  list(): Promise<readonly string[]>;
  add(slug: string): Promise<readonly string[]>;
  remove(slug: string): Promise<readonly string[]>;
}
