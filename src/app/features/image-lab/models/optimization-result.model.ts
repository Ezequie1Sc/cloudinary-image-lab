export interface MeasuredImageResource {
  readonly url: string;
  readonly objectUrl: string | null;
  readonly bytes: number | null;
  readonly contentType: string | null;
  readonly formatLabel: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface OptimizationResult {
  readonly original: MeasuredImageResource;
  readonly optimized: MeasuredImageResource;
  readonly bytesSaved: number | null;
  readonly reductionPercentage: number | null;
  readonly isHeavier: boolean;
  readonly includesResizing: boolean;
  readonly corsLimited: boolean;
}

export type LabLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
