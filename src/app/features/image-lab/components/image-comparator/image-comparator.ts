import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import {
  LucideAlertTriangle,
  LucideMoveHorizontal,
  LucideRefreshCw,
  LucideDownload,
  LucideZoomIn,
  LucideZoomOut,
  LucideMaximize,
  LucideMinimize,
  LucideRotateCcw,
  LucideLoaderCircle,
} from '@lucide/angular';

import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';

import { ButtonComponent } from '../../../../shared/components/button/button';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import type { DemoImageAsset } from '../../models/image.model';

import type { LabLoadStatus, OptimizationResult } from '../../models/optimization-result.model';

import {
  COMPARISON_MODES,
  DEFAULT_PAN,
  DEFAULT_SLIDER_POSITION,
  KEYBOARD_LARGE_STEP,
  KEYBOARD_STEP,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from './image-comparator.constants';

import type {
  ComparisonMode,
  DownloadTarget,
  PanPosition,
  PointerOrigin,
} from './image-comparator.model';

import { ImageDownloadService } from './services/image-download.service';

@Component({
  selector: 'cil-image-comparator',
  standalone: true,
  imports: [
    LucideAlertTriangle,
    LucideMoveHorizontal,
    LucideRefreshCw,
    LucideDownload,
    LucideZoomIn,
    LucideZoomOut,
    LucideMaximize,
    LucideMinimize,
    LucideRotateCcw,
    LucideLoaderCircle,
    TranslatePipe,
    SkeletonComponent,
    ButtonComponent,
  ],
  templateUrl: './image-comparator.html',
  styleUrl: './image-comparator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComparatorComponent {
  protected readonly languageService = inject(LanguageService);

  private readonly toast = inject(ToastService);

  private readonly downloadService = inject(ImageDownloadService);

  private readonly destroyRef = inject(DestroyRef);

  readonly asset = input.required<DemoImageAsset>();

  readonly originalUrl = input.required<string>();

  readonly optimizedUrl = input.required<string>();

  readonly result = input<OptimizationResult | null>(null);

  readonly status = input<LabLoadStatus>('idle');

  readonly errorKey = input<string | null>(null);

  readonly retry = output<void>();

  private readonly stageRef = viewChild<ElementRef<HTMLDivElement>>('stage');

  private readonly comparatorRef = viewChild<ElementRef<HTMLElement>>('comparator');

  protected readonly modes = COMPARISON_MODES;

  protected readonly mode = signal<ComparisonMode>('slider');

  protected readonly position = signal(DEFAULT_SLIDER_POSITION);

  protected readonly zoom = signal(MIN_ZOOM);

  protected readonly pan = signal<PanPosition>(DEFAULT_PAN);

  protected readonly isDragging = signal(false);

  protected readonly isPanning = signal(false);

  protected readonly isFullscreen = signal(false);

  protected readonly downloading = signal<DownloadTarget | null>(null);

  private pointerOrigin: PointerOrigin | null = null;

  protected readonly canZoomIn = computed(() => this.zoom() < MAX_ZOOM);

  protected readonly canZoomOut = computed(() => this.zoom() > MIN_ZOOM);

  protected readonly originalSrc = computed(() => {
    const resource = this.result()?.original;

    return resource?.url === this.originalUrl()
      ? (resource.objectUrl ?? this.originalUrl())
      : this.originalUrl();
  });

  protected readonly optimizedSrc = computed(() => {
    const resource = this.result()?.optimized;

    return resource?.url === this.optimizedUrl()
      ? (resource.objectUrl ?? this.optimizedUrl())
      : this.optimizedUrl();
  });

  protected readonly altText = computed(() => {
    const lang = this.languageService.language();

    return this.asset().alt[lang];
  });

  protected readonly clipPath = computed(() => `inset(0 ${100 - this.position()}% 0 0)`);

  protected readonly imageTransform = computed(() => {
    const pan = this.pan();
    const scale = this.zoom() / 100;

    return `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
  });

  constructor() {
    effect(() => {
      const assetId = this.asset().id;

      if (assetId) {
        untracked(() => this.resetView());
      }
    });

    if (typeof document !== 'undefined') {
      const onFullscreenChange = (): void => {
        this.isFullscreen.set(document.fullscreenElement === this.comparatorRef()?.nativeElement);
      };

      document.addEventListener('fullscreenchange', onFullscreenChange);

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
      });
    }
  }

  protected selectMode(mode: ComparisonMode): void {
    this.mode.set(mode);
    this.resetView();
  }

  protected zoomIn(): void {
    this.setZoom(this.zoom() + ZOOM_STEP);
  }

  protected zoomOut(): void {
    this.setZoom(this.zoom() - ZOOM_STEP);
  }

  private setZoom(value: number): void {
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

    this.zoom.set(nextZoom);

    if (nextZoom === MIN_ZOOM) {
      this.pan.set(DEFAULT_PAN);
    } else {
      this.updatePan(this.pan());
    }
  }

  protected resetView(): void {
    this.zoom.set(MIN_ZOOM);
    this.pan.set(DEFAULT_PAN);
    this.position.set(DEFAULT_SLIDER_POSITION);
    this.isDragging.set(false);
    this.isPanning.set(false);
    this.pointerOrigin = null;
  }

  protected async toggleFullscreen(): Promise<void> {
    const element = this.comparatorRef()?.nativeElement;

    if (!element || typeof document === 'undefined') {
      return;
    }

    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else {
        throw new Error('Fullscreen unavailable');
      }
    } catch {
      this.toast.show(this.languageService.translate('comparison.fullscreenError'), 'error');
    }
  }

  protected async downloadImage(target: DownloadTarget): Promise<void> {
    if (this.downloading() || this.status() !== 'ready') {
      return;
    }

    this.downloading.set(target);

    const url = target === 'original' ? this.originalUrl() : this.optimizedUrl();

    const resource = this.result()?.[target];

    const existingObjectUrl = resource?.url === url ? resource.objectUrl : null;

    try {
      await this.downloadService.download(
        url,
        `cloudinary-${this.asset().id}-${target}`,
        existingObjectUrl
      );

      this.toast.show(this.languageService.translate('comparison.downloadSuccess'), 'success');
    } catch {
      this.toast.show(this.languageService.translate('comparison.downloadError'), 'error');
    } finally {
      this.downloading.set(null);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this.status() === 'loading') {
      return;
    }

    const target = event.currentTarget as HTMLElement;

    const isHandle =
      event.target instanceof Element && Boolean(event.target.closest('.cil-handle'));

    if (this.zoom() > MIN_ZOOM && !isHandle) {
      this.isPanning.set(true);

      this.pointerOrigin = {
        x: event.clientX,
        y: event.clientY,
        panX: this.pan().x,
        panY: this.pan().y,
      };
    } else if (this.mode() === 'slider') {
      this.isDragging.set(true);
      this.updatePositionFromClientX(event.clientX);
    } else {
      return;
    }

    target.setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.isPanning() && this.pointerOrigin) {
      this.updatePan({
        x: this.pointerOrigin.panX + event.clientX - this.pointerOrigin.x,

        y: this.pointerOrigin.panY + event.clientY - this.pointerOrigin.y,
      });

      return;
    }

    if (this.isDragging()) {
      this.updatePositionFromClientX(event.clientX);
    }
  }

  protected onPointerUp(): void {
    this.isDragging.set(false);
    this.isPanning.set(false);
    this.pointerOrigin = null;
  }

  protected onSliderKeyDown(event: KeyboardEvent): void {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();

        this.position.update((position) => Math.max(0, position - step));

        break;

      case 'ArrowRight':
        event.preventDefault();

        this.position.update((position) => Math.min(100, position + step));

        break;

      case 'Home':
        event.preventDefault();
        this.position.set(0);
        break;

      case 'End':
        event.preventDefault();
        this.position.set(100);
        break;
    }
  }

  private updatePan(position: PanPosition): void {
    const stage = this.stageRef()?.nativeElement;

    if (!stage) {
      return;
    }

    const scale = this.zoom() / 100;

    const width = this.mode() === 'side-by-side' ? stage.clientWidth / 2 : stage.clientWidth;

    const maxX = (width * (scale - 1)) / 2;

    const maxY = (stage.clientHeight * (scale - 1)) / 2;

    this.pan.set({
      x: Math.max(-maxX, Math.min(maxX, position.x)),

      y: Math.max(-maxY, Math.min(maxY, position.y)),
    });
  }

  private updatePositionFromClientX(clientX: number): void {
    const stage = this.stageRef()?.nativeElement;

    if (!stage) {
      return;
    }

    const rect = stage.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio = ((clientX - rect.left) / rect.width) * 100;

    this.position.set(Math.min(100, Math.max(0, Math.round(ratio * 10) / 10)));
  }
}
