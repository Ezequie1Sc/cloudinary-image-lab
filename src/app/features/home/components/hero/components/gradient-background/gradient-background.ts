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

import { GRADIENT_FIELD_CONFIG } from './gradient-background.constants';

import type {
  GradientParticle,
  GradientPointer,
  GradientViewport,
} from './gradient-background.model';

@Component({
  selector: 'cil-gradient-background',
  standalone: true,
  templateUrl: './gradient-background.html',
  styleUrl: './gradient-background.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradientBackgroundComponent {
  private readonly config = GRADIENT_FIELD_CONFIG;

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('gradientCanvas');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  private interactionSurface: HTMLElement | null = null;

  private resizeObserver: ResizeObserver | null = null;

  private intersectionObserver: IntersectionObserver | null = null;

  private motionPreference: MediaQueryList | null = null;

  private animationFrame: number | null = null;

  private particles: GradientParticle[] = [];

  private viewport: GradientViewport = {
    width: 0,
    height: 0,
  };

  private readonly pointer: GradientPointer = {
    x: -1000,
    y: -1000,
    active: false,
  };

  private pixelRatio = 1;

  private lastFrameTime = 0;
  private elapsedTime = 0;

  private pointerStrength = 0;

  private visible = true;
  private destroyed = false;

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

    this.context = this.canvas.getContext('2d', {
      alpha: false,
    });

    if (!this.context) {
      return;
    }

    this.interactionSurface = this.host.nativeElement.parentElement;

    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    this.motionPreference.addEventListener('change', this.handleMotionPreference);

    this.resizeCanvas();
    this.registerListeners();
    this.registerObservers();

    this.startAnimation();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.context) {
      return;
    }

    const bounds = this.host.nativeElement.getBoundingClientRect();

    this.viewport = {
      width: Math.max(1, bounds.width),
      height: Math.max(1, bounds.height),
    };

    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.config.maxDevicePixelRatio);

    this.canvas.width = Math.floor(this.viewport.width * this.pixelRatio);

    this.canvas.height = Math.floor(this.viewport.height * this.pixelRatio);

    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);

    this.createParticles();
    this.render();
  }

  private createParticles(): void {
    const { width, height } = this.viewport;

    const spacing =
      width < this.config.mobileBreakpoint ? this.config.mobileSpacing : this.config.desktopSpacing;

    const particles: GradientParticle[] = [];

    for (let y = 0; y <= height; y += spacing) {
      for (let x = 0; x <= width; x += spacing) {
        particles.push({
          originX: x,
          originY: y,

          x,
          y,

          phase: Math.sin(x * 0.025) * Math.cos(y * 0.018) * Math.PI,
        });
      }
    }

    this.particles = particles;
  }

  private registerListeners(): void {
    this.interactionSurface?.addEventListener('pointermove', this.handlePointerMove, {
      passive: true,
    });

    this.interactionSurface?.addEventListener('pointerdown', this.handlePointerMove, {
      passive: true,
    });

    this.interactionSurface?.addEventListener('pointerleave', this.handlePointerLeave);

    this.interactionSurface?.addEventListener('pointercancel', this.handlePointerLeave);

    this.interactionSurface?.addEventListener('pointerup', this.handlePointerUp);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
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

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.motionPreference?.matches) {
      return;
    }

    const bounds = this.host.nativeElement.getBoundingClientRect();

    this.pointer.x = event.clientX - bounds.left;
    this.pointer.y = event.clientY - bounds.top;
    this.pointer.active = true;
  };

  private readonly handlePointerLeave = (): void => {
    this.pointer.active = false;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') {
      this.pointer.active = false;
    }
  };

  private updateParticles(): void {
    const time = this.elapsedTime * this.config.animationSpeed;

    const interactionRadius = this.config.interactionRadius;

    this.pointerStrength += ((this.pointer.active ? 1 : 0) - this.pointerStrength) * 0.12;

    for (const particle of this.particles) {
      const waveX =
        Math.sin(particle.originY * 0.014 + time + particle.phase) * this.config.waveAmplitude;

      const waveY =
        Math.cos(particle.originX * 0.012 - time * 0.8 + particle.phase) *
        this.config.waveAmplitude;

      let targetX = particle.originX + waveX;
      let targetY = particle.originY + waveY;

      const deltaX = targetX - this.pointer.x;
      const deltaY = targetY - this.pointer.y;

      const distance = Math.hypot(deltaX, deltaY);

      if (this.pointerStrength > 0.01 && distance < interactionRadius && distance > 0.001) {
        const influence = 1 - distance / interactionRadius;

        const force =
          influence * influence * this.config.interactionStrength * this.pointerStrength;

        targetX += (deltaX / distance) * force;
        targetY += (deltaY / distance) * force;
      }

      particle.x += (targetX - particle.x) * this.config.recoverySpeed;

      particle.y += (targetY - particle.y) * this.config.recoverySpeed;
    }
  }

  private render(): void {
    const context = this.context;

    if (!context) {
      return;
    }

    const { width, height } = this.viewport;

    context.globalAlpha = 1;

    context.fillStyle = this.config.backgroundColor;

    context.fillRect(0, 0, width, height);

    const time = this.elapsedTime * this.config.animationSpeed;

    context.fillStyle = '#e4e4e7';

    for (const particle of this.particles) {
      const normalizedX = particle.originX / width;
      const normalizedY = particle.originY / height;

      const wave =
        Math.sin(normalizedX * 10 + normalizedY * 5 + time + particle.phase) *
        Math.cos(normalizedY * 7 - normalizedX * 3 - time * 0.7);

      const intensity = Math.pow((wave + 1) * 0.5, 2);

      const edgeIntensity = Math.min(1, Math.abs(normalizedX - 0.5) * 2.2);

      const pointerDistance = Math.hypot(particle.x - this.pointer.x, particle.y - this.pointer.y);

      const pointerInfluence =
        Math.max(0, 1 - pointerDistance / this.config.interactionRadius) * this.pointerStrength;

      const opacity = Math.min(
        0.9,
        0.06 + intensity * 0.65 + edgeIntensity * 0.13 + pointerInfluence * 0.45
      );

      const radius =
        this.config.particleMinRadius +
        intensity * (this.config.particleMaxRadius - this.config.particleMinRadius) +
        pointerInfluence * 0.5;

      context.globalAlpha = opacity;

      context.beginPath();

      context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);

      context.fill();
    }

    context.globalAlpha = 1;
  }

  private startAnimation(): void {
    if (
      this.destroyed ||
      !this.context ||
      !this.visible ||
      document.hidden ||
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

    if (this.destroyed || !this.visible || document.hidden || this.motionPreference?.matches) {
      return;
    }

    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestamp;
    }

    const frameInterval = 1000 / this.config.targetFps;

    const delta = timestamp - this.lastFrameTime;

    if (delta >= frameInterval - 1) {
      this.elapsedTime += Math.min(delta, 100) / 1000;

      this.lastFrameTime = timestamp;

      this.updateParticles();
      this.render();
    }

    this.animationFrame = requestAnimationFrame(this.animate);
  };

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

  private dispose(): void {
    this.destroyed = true;

    this.stopAnimation();

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    this.motionPreference?.removeEventListener('change', this.handleMotionPreference);

    this.interactionSurface?.removeEventListener('pointermove', this.handlePointerMove);

    this.interactionSurface?.removeEventListener('pointerdown', this.handlePointerMove);

    this.interactionSurface?.removeEventListener('pointerleave', this.handlePointerLeave);

    this.interactionSurface?.removeEventListener('pointercancel', this.handlePointerLeave);

    this.interactionSurface?.removeEventListener('pointerup', this.handlePointerUp);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.particles = [];

    this.context = null;
    this.canvas = null;
    this.interactionSurface = null;
  }
}
