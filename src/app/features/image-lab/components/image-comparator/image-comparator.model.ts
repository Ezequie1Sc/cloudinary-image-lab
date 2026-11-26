export type ComparisonMode = 'slider' | 'side-by-side' | 'original' | 'optimized';

export type DownloadTarget = 'original' | 'optimized';

export interface PanPosition {
  readonly x: number;
  readonly y: number;
}

export interface PointerOrigin {
  readonly x: number;
  readonly y: number;
  readonly panX: number;
  readonly panY: number;
}
