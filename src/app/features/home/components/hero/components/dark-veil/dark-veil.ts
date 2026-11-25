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

import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';

import { DARK_VEIL_CONFIG } from './dark-veil.constants';
import { DARK_VEIL_VERTEX_SHADER } from './shaders/vertex.shader';
import { DARK_VEIL_FRAGMENT_SHADER } from './shaders/fragment.shader';

interface VeilUniforms {
  u_resolution: { value: Vec2 };
  u_pointer: { value: Vec2 };
  u_time: { value: number };
  u_intensity: { value: number };
  u_distortion: { value: number };
  u_revealRadius: { value: number };
  u_revealIntensity: { value: number };
  u_pointerStrength: { value: number };
}

@Component({
  selector: 'cil-dark-veil',
  standalone: true,
  templateUrl: './dark-veil.html',
  styleUrl: './dark-veil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DarkVeilComponent {
  private readonly config = DARK_VEIL_CONFIG;

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('veilCanvas');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private renderer: Renderer | null = null;
  private geometry: Triangle | null = null;
  private program: Program | null = null;
  private mesh: Mesh | null = null;

  private uniforms: VeilUniforms | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private interactionSurface: HTMLElement | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private motionPreference: MediaQueryList | null = null;

  private animationFrame: number | null = null;

  private readonly pointer = new Vec2(0.5, 0.5);
  private readonly targetPointer = new Vec2(0.5, 0.5);

  private pointerStrength = 0;
  private targetPointerStrength = 0;

  private elapsedTime = 0;
  private lastFrameTime = 0;

  private visible = true;
  private destroyed = false;
  private contextLost = false;

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

    this.canvas.style.visibility = 'hidden';

    this.interactionSurface = this.host.nativeElement.parentElement;

    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.motionPreference.addEventListener('change', this.handleMotionPreference);

    this.registerListeners();
    this.registerObservers();

    if (!this.motionPreference.matches) {
      this.createScene();
    }
  }

  private createScene(): void {
    if (!this.canvas || this.renderer || this.destroyed || this.contextLost) {
      return;
    }

    try {
      const renderer = new Renderer({
        canvas: this.canvas,
        dpr: 1,

        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,

        webgl: 1,

        powerPreference: 'low-power',
        preserveDrawingBuffer: false,
      });

      this.renderer = renderer;

      const gl = renderer.gl;

      gl.clearColor(0.035, 0.035, 0.043, 1);

      this.geometry = new Triangle(gl);

      this.uniforms = {
        u_resolution: {
          value: new Vec2(1, 1),
        },

        u_pointer: {
          value: this.pointer,
        },

        u_time: {
          value: 0,
        },

        u_intensity: {
          value: this.config.intensity,
        },

        u_distortion: {
          value: this.config.distortion,
        },

        u_revealRadius: {
          value: this.config.revealRadius,
        },

        u_revealIntensity: {
          value: this.config.revealIntensity,
        },

        u_pointerStrength: {
          value: 0,
        },
      };

      this.program = new Program(gl, {
        vertex: DARK_VEIL_VERTEX_SHADER,
        fragment: DARK_VEIL_FRAGMENT_SHADER,

        uniforms: { ...this.uniforms },

        depthTest: false,
        depthWrite: false,
        cullFace: false,
      });

      if (!gl.getProgramParameter(this.program.program, gl.LINK_STATUS)) {
        this.releaseResources();
        return;
      }

      this.mesh = new Mesh(gl, {
        geometry: this.geometry,
        program: this.program,
      });

      this.resizeCanvas();

      this.canvas.style.visibility = 'visible';

      this.startAnimation();
    } catch {
      this.releaseResources();
    }
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

    this.interactionSurface?.addEventListener('pointerup', this.handlePointerUp);

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
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry?.isIntersecting ?? false;

        if (this.visible) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      });

      this.intersectionObserver.observe(this.interactionSurface);
    }
  }

  private resizeCanvas(): void {
    if (!this.renderer || !this.uniforms || !this.canvas || this.contextLost) {
      return;
    }

    const bounds = this.host.nativeElement.getBoundingClientRect();

    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);

    const pixelRatio = Math.min(window.devicePixelRatio || 1, this.config.maxDevicePixelRatio);

    const mobileScale =
      width < this.config.mobileBreakpoint ? this.config.mobileResolutionScale : 1;

    const scale = Math.min(
      pixelRatio * mobileScale,
      this.config.maxRenderWidth / width,
      this.config.maxRenderHeight / height
    );

    const renderWidth = Math.max(1, Math.floor(width * scale));

    const renderHeight = Math.max(1, Math.floor(height * scale));

    this.renderer.setSize(renderWidth, renderHeight);

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.uniforms.u_resolution.value.set(this.canvas.width, this.canvas.height);

    this.render();
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.motionPreference?.matches || this.contextLost) {
      return;
    }

    this.updatePointer(event);

    this.targetPointerStrength = 1;
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.motionPreference?.matches || this.contextLost) {
      return;
    }

    this.updatePointer(event);

    this.targetPointerStrength = 1.35;
  };

  private readonly handlePointerLeave = (): void => {
    this.targetPointerStrength = 0;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.targetPointerStrength = event.pointerType === 'mouse' ? 1 : 0;
  };

  private updatePointer(event: PointerEvent): void {
    const bounds = this.host.nativeElement.getBoundingClientRect();

    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));

    const y = Math.max(0, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height));

    this.targetPointer.set(x, y);
  }

  private startAnimation(): void {
    if (
      this.destroyed ||
      !this.renderer ||
      !this.mesh ||
      !this.visible ||
      document.hidden ||
      this.contextLost ||
      this.motionPreference?.matches ||
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
      this.motionPreference?.matches ||
      !this.renderer ||
      !this.mesh
    ) {
      return;
    }

    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
    }

    const interval = 1000 / this.config.targetFps;

    const delta = timestamp - this.lastFrameTime;

    if (delta >= interval - 1) {
      this.lastFrameTime = timestamp;

      this.elapsedTime += Math.min(delta, 100) / 1000;

      this.updateUniforms();

      this.render();
    }

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private updateUniforms(): void {
    if (!this.uniforms) {
      return;
    }

    const smoothing = this.config.pointerSmoothing;

    this.pointer.x += (this.targetPointer.x - this.pointer.x) * smoothing;

    this.pointer.y += (this.targetPointer.y - this.pointer.y) * smoothing;

    this.pointerStrength += (this.targetPointerStrength - this.pointerStrength) * smoothing;

    this.uniforms.u_time.value = this.elapsedTime * this.config.speed;

    this.uniforms.u_pointerStrength.value = this.pointerStrength;
  }

  private render(): void {
    if (!this.renderer || !this.mesh || this.contextLost || this.motionPreference?.matches) {
      return;
    }

    this.renderer.render({
      scene: this.mesh,
    });
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
      this.releaseResources();

      return;
    }

    this.createScene();
    this.startAnimation();
  };

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault();

    this.contextLost = true;

    this.releaseResources();
  };

  private readonly handleContextRestored = (): void => {
    if (this.destroyed) {
      return;
    }

    this.contextLost = false;

    if (!this.motionPreference?.matches) {
      this.createScene();
    }
  };

  private releaseResources(): void {
    this.stopAnimation();

    if (!this.contextLost) {
      this.geometry?.remove();
      this.program?.remove();
    }

    if (this.canvas) {
      this.canvas.style.visibility = 'hidden';
    }

    this.mesh = null;
    this.geometry = null;
    this.program = null;
    this.uniforms = null;
    this.renderer = null;
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

    this.interactionSurface?.removeEventListener('pointerup', this.handlePointerUp);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.canvas?.removeEventListener('webglcontextlost', this.handleContextLost);

    this.canvas?.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.releaseResources();

    this.canvas = null;
    this.interactionSurface = null;
  }
}
