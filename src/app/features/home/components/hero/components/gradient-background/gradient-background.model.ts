export interface GradientParticle {
  readonly originX: number;
  readonly originY: number;
  readonly phase: number;

  x: number;
  y: number;
}

export interface GradientPointer {
  x: number;
  y: number;
  active: boolean;
}

export interface GradientViewport {
  width: number;
  height: number;
}
