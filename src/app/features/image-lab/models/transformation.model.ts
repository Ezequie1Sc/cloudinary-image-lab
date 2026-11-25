export type OutputFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png';

export type QualityMode =
  | 'auto'
  | 'auto:best'
  | 'auto:good'
  | 'auto:eco'
  | 'auto:low'
  | 'manual';

export type MaxWidthOption = 320 | 640 | 800 | 1280 | 1920 | null;

export interface TransformationConfig {
  readonly format: OutputFormat;
  readonly qualityMode: QualityMode;
  readonly manualQuality: number;
  readonly maxWidth: MaxWidthOption;
}

export const DEFAULT_TRANSFORMATION_CONFIG: TransformationConfig = {
  format: 'auto',
  qualityMode: 'auto',
  manualQuality: 80,
  maxWidth: 800,
};

export const OUTPUT_FORMAT_OPTIONS: readonly OutputFormat[] = [
  'auto',
  'webp',
  'avif',
  'jpg',
  'png',
];

export const QUALITY_MODE_OPTIONS: readonly QualityMode[] = [
  'auto',
  'auto:best',
  'auto:good',
  'auto:eco',
  'auto:low',
  'manual',
];

export const MAX_WIDTH_OPTIONS: readonly MaxWidthOption[] = [320, 640, 800, 1280, 1920, null];
export const RESPONSIVE_CANDIDATE_WIDTHS: readonly number[] = [320, 640, 800, 1280, 1920];
export const MIN_MANUAL_QUALITY = 10;
export const MAX_MANUAL_QUALITY = 100;
