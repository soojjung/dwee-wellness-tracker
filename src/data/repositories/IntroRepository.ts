export interface IntroRepository {
  isSeen(): Promise<boolean>;
  markSeen(): Promise<void>;
}
