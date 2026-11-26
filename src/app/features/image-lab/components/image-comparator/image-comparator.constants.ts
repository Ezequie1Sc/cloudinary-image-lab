import type { ComparisonMode, PanPosition } from './image-comparator.model';

export const DEFAULT_SLIDER_POSITION = 50;

export const MIN_ZOOM = 100;
export const MAX_ZOOM = 400;
export const ZOOM_STEP = 25;

export const KEYBOARD_STEP = 5;
export const KEYBOARD_LARGE_STEP = 15;

export const DEFAULT_PAN: PanPosition = {
  x: 0,
  y: 0,
};

export const COMPARISON_MODES: readonly {
  id: ComparisonMode;
  label: string;
}[] = [
  {
    id: 'slider',
    label: 'comparison.modes.slider',
  },
  {
    id: 'side-by-side',
    label: 'comparison.modes.sideBySide',
  },
  {
    id: 'original',
    label: 'comparison.original',
  },
  {
    id: 'optimized',
    label: 'comparison.optimized',
  },
];
