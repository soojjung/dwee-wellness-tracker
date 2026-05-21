export interface HomeOverlay {
  id: string;
  blob: Blob;
  x: number;
  y: number;
}

export interface MediaRepository {
  getHomeHero(): Promise<Blob | null>;
  setHomeHero(blob: Blob): Promise<void>;
  clearHomeHero(): Promise<void>;
  listOverlays(): Promise<HomeOverlay[]>;
  addOverlay(blob: Blob): Promise<HomeOverlay>;
  updateOverlayPosition(id: string, x: number, y: number): Promise<void>;
  removeOverlay(id: string): Promise<void>;
}
