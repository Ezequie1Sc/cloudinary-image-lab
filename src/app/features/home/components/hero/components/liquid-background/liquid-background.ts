import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  viewChild,
} from '@angular/core';

import { LIQUID_VERTEX_SHADER } from './shaders/vertex.shader';
import { LIQUID_FRAGMENT_SHADER } from './shaders/fragment.shader';

interface LiquidUniforms {
  readonly resolution: WebGLUniformLocation | null;
  readonly time: WebGLUniformLocation | null;
  readonly pointer: WebGLUniformLocation | null;
  readonly pointerStrength: WebGLUniformLocation | null;
  readonly ripples: WebGLUniformLocation | null;
}

const MAX_RIPPLES = 8;
const MAX_DEVICE_PIXEL_RATIO = 1.25;
const MAX_RENDER_WIDTH = 1280;
const MAX_RENDER_HEIGHT = 720;
const TARGET_FRAME_INTERVAL = 1000 / 30;
const RIPPLE_INTERVAL = 120;
const MIN_POINTER_DISTANCE = 0.035;

@Component({
  selector: 'cil-liquid-background',
  standalone: true,
  templateUrl: './liquid-background.html',
  styleUrl: './liquid-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiquidBackgroundComponent {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('liquidCanvas');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private uniforms: LiquidUniforms | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private interactionSurface: HTMLElement | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  private motionPreference: MediaQueryList | null = null;

  private animationFrame: number | null = null;
  private lastFrameTime = 0;
  private startTime = 0;
  private lastRippleTime = -Infinity;

  private visible = true;
  private destroyed = false;
  private contextLost = false;

  private pointerX = 0.5;
  private pointerY = 0.5;

  private previousPointerX = -1;
  private previousPointerY = -1;

  private pointerStrength = 0;
  private targetPointerStrength = 0;

  private rippleIndex = 0;

  private readonly ripples = new Float32Array(MAX_RIPPLES * 4);

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        this.initialize();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.dispose();
    });
  }

  private initialize(): void {
    if (this.destroyed) {
      return;
    }

    this.canvas = this.canvasRef().nativeElement;
    this.interactionSurface = this.host.nativeElement.parentElement;

    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.motionPreference.addEventListener('change', this.handleMotionPreference);

    if (!this.createResources()) {
      return;
    }

    this.startTime = performance.now();

    this.resizeCanvas();
    this.registerListeners();
    this.registerObservers();
    this.startAnimation();
  }

  private createResources(): boolean {
    if (!this.canvas) {
      return false;
    }

    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });

    if (!gl) {
      return false;
    }

    this.gl = gl;

    const vertexShader = this.compileShader(gl.VERTEX_SHADER, LIQUID_VERTEX_SHADER);

    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, LIQUID_FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) {
        gl.deleteShader(vertexShader);
      }

      if (fragmentShader) {
        gl.deleteShader(fragmentShader);
      }

      return false;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return false;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);

      return false;
    }

    this.program = program;

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');

    const vertexBuffer = gl.createBuffer();

    if (!vertexBuffer || positionLocation < 0) {
      if (vertexBuffer) {
        gl.deleteBuffer(vertexBuffer);
      }

      this.releaseResources();

      return false;
    }

    this.vertexBuffer = vertexBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),

      time: gl.getUniformLocation(program, 'u_time'),

      pointer: gl.getUniformLocation(program, 'u_pointer'),

      pointerStrength: gl.getUniformLocation(program, 'u_pointerStrength'),

      ripples: gl.getUniformLocation(program, 'u_ripples[0]'),
    };

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    return true;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;

    if (!gl) {
      return null;
    }

    const shader = gl.createShader(type);

    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);

      return null;
    }

    return shader;
  }

  private registerListeners(): void {
    this.interactionSurface?.addEventListener('pointermove', this.handlePointerMove, {
      passive: true,
    });

    this.interactionSurface?.addEventListener('pointerdown', this.handlePointerDown, {
      passive: true,
    });

    this.interactionSurface?.addEventListener('pointerleave', this.handlePointerLeave);

    this.interactionSurface?.addEventListener('pointercancel', this.handlePointerLeave);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.canvas?.addEventListener('webglcontextlost', this.handleContextLost);

    this.canvas?.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private registerObservers(): void {
    if (this.interactionSurface && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });

      this.resizeObserver.observe(this.interactionSurface);
    }

    if (this.interactionSurface && typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry?.isIntersecting ?? false;

          if (this.visible) {
            this.startAnimation();
          } else {
            this.stopAnimation();
          }
        },
        {
          threshold: 0,
        }
      );

      this.intersectionObserver.observe(this.interactionSurface);
    }
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.gl || this.contextLost) {
      return;
    }

    const bounds = this.host.nativeElement.getBoundingClientRect();

    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);

    const width = Math.max(1, bounds.width * pixelRatio);

    const height = Math.max(1, bounds.height * pixelRatio);

    const scale = Math.min(1, MAX_RENDER_WIDTH / width, MAX_RENDER_HEIGHT / height);

    this.canvas.width = Math.max(1, Math.floor(width * scale));

    this.canvas.height = Math.max(1, Math.floor(height * scale));

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.render(performance.now());
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.motionPreference?.matches || this.contextLost) {
      return;
    }

    this.updatePointer(event);

    this.targetPointerStrength = 0.65;

    const distance = Math.hypot(
      this.pointerX - this.previousPointerX,
      this.pointerY - this.previousPointerY
    );

    const now = performance.now();

    if (distance >= MIN_POINTER_DISTANCE && now - this.lastRippleTime >= RIPPLE_INTERVAL) {
      this.addRipple(now, 0.75);

      this.previousPointerX = this.pointerX;
      this.previousPointerY = this.pointerY;
    }
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.motionPreference?.matches || this.contextLost) {
      return;
    }

    this.updatePointer(event);

    this.targetPointerStrength = 1;

    this.addRipple(performance.now(), 1.25);
  };

  private readonly handlePointerLeave = (): void => {
    this.targetPointerStrength = 0;
  };

  private updatePointer(event: PointerEvent): void {
    const bounds = this.host.nativeElement.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    this.pointerX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));

    this.pointerY = Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height));
  }

  private addRipple(timestamp: number, strength: number): void {
    const offset = this.rippleIndex * 4;

    this.ripples[offset] = this.pointerX;
    this.ripples[offset + 1] = this.pointerY;

    this.ripples[offset + 2] = (timestamp - this.startTime) / 1000;

    this.ripples[offset + 3] = strength;

    this.rippleIndex = (this.rippleIndex + 1) % MAX_RIPPLES;

    this.lastRippleTime = timestamp;
  }

  private startAnimation(): void {
    if (
      this.destroyed ||
      this.contextLost ||
      !this.visible ||
      document.hidden ||
      this.motionPreference?.matches ||
      !this.program ||
      this.animationFrame !== null
    ) {
      return;
    }

    this.lastFrameTime = 0;

    this.animationFrame = requestAnimationFrame(this.animate);
  }

  private stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);

      this.animationFrame = null;
    }
  }

  private readonly animate = (timestamp: number): void => {
    this.animationFrame = null;

    if (
      this.destroyed ||
      this.contextLost ||
      !this.visible ||
      document.hidden ||
      this.motionPreference?.matches
    ) {
      return;
    }

    const elapsed = timestamp - this.lastFrameTime;

    if (elapsed >= TARGET_FRAME_INTERVAL - 1) {
      this.lastFrameTime = timestamp - (elapsed % TARGET_FRAME_INTERVAL);

      this.pointerStrength += (this.targetPointerStrength - this.pointerStrength) * 0.12;

      this.render(timestamp);
    }

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private render(timestamp: number): void {
    const gl = this.gl;
    const uniforms = this.uniforms;
    const canvas = this.canvas;

    if (
      !gl ||
      !uniforms ||
      !canvas ||
      !this.program ||
      this.contextLost ||
      this.motionPreference?.matches
    ) {
      return;
    }

    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);

    gl.uniform1f(uniforms.time, Math.max(0, (timestamp - this.startTime) / 1000));

    gl.uniform2f(uniforms.pointer, this.pointerX, this.pointerY);

    gl.uniform1f(uniforms.pointerStrength, this.pointerStrength);

    gl.uniform4fv(uniforms.ripples, this.ripples);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  };

  private readonly handleMotionPreference = (): void => {
    if (this.motionPreference?.matches) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();

    this.contextLost = true;

    this.stopAnimation();

    this.program = null;
    this.vertexBuffer = null;
    this.uniforms = null;
  };

  private readonly handleContextRestored = (): void => {
    if (this.destroyed) {
      return;
    }

    this.contextLost = false;

    if (this.createResources()) {
      this.ripples.fill(0);

      this.startTime = performance.now();

      this.resizeCanvas();
      this.startAnimation();
    }
  };

  private releaseResources(): void {
    if (this.gl && !this.contextLost) {
      if (this.vertexBuffer) {
        this.gl.deleteBuffer(this.vertexBuffer);
      }

      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
    }

    this.vertexBuffer = null;
    this.program = null;
    this.uniforms = null;
    this.gl = null;
  }

  private dispose(): void {
    this.destroyed = true;

    this.stopAnimation();

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    this.motionPreference?.removeEventListener('change', this.handleMotionPreference);

    this.interactionSurface?.removeEventListener('pointermove', this.handlePointerMove);

    this.interactionSurface?.removeEventListener('pointerdown', this.handlePointerDown);

    this.interactionSurface?.removeEventListener('pointerleave', this.handlePointerLeave);

    this.interactionSurface?.removeEventListener('pointercancel', this.handlePointerLeave);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.canvas?.removeEventListener('webglcontextlost', this.handleContextLost);

    this.canvas?.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.releaseResources();

    this.canvas = null;
    this.interactionSurface = null;
  }
}
