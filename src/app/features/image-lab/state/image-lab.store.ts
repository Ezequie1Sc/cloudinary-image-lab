import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEMO_IMAGE_ASSETS } from '../../../core/constants/demo-images.constant';
import type { DemoImageAsset, ImageCategory } from '../models/image.model';
import type { LabLoadStatus, OptimizationResult } from '../models/optimization-result.model';
import {
  DEFAULT_TRANSFORMATION_CONFIG,
  type MaxWidthOption,
  type OutputFormat,
  type QualityMode,
  type TransformationConfig,
} from '../models/transformation.model';
import { CloudinaryService } from '../services/cloudinary.service';
import { ImageMetricsService } from '../services/image-metrics.service';
import { clampQuality } from '../utils/optimization.utils';

interface MeasurementRequest {
  readonly originalUrl: string;
  readonly optimizedUrl: string;
}

const TRANSFORMATION_DEBOUNCE_MS = 180;

@Injectable()
export class ImageLabStore {
  private readonly cloudinary = inject(CloudinaryService);
  private readonly metricsService = inject(ImageMetricsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly measureTrigger$ = new Subject<MeasurementRequest>();
  private activeAbortController: AbortController | null = null;

  readonly assets = signal<readonly DemoImageAsset[]>(DEMO_IMAGE_ASSETS).asReadonly();
  readonly selectedCategory = signal<ImageCategory | 'all'>('all');
  readonly selectedImage = signal<DemoImageAsset>(DEMO_IMAGE_ASSETS[0]);
  readonly config = signal<TransformationConfig>(DEFAULT_TRANSFORMATION_CONFIG);

  readonly status = signal<LabLoadStatus>('idle');
  readonly result = signal<OptimizationResult | null>(null);
  readonly errorKey = signal<string | null>(null);

  readonly filteredAssets = computed(() => {
    const category = this.selectedCategory();
    const list = this.assets();
    return category === 'all' ? list : list.filter((item) => item.category === category);
  });

  readonly originalUrl = computed(() =>
    this.cloudinary.buildOriginalUrl(this.selectedImage().publicId)
  );

  readonly optimizedUrl = computed(() =>
    this.cloudinary.buildTransformedUrl(this.selectedImage().publicId, this.config())
  );

  readonly optimizedCloudinaryImage = computed(() =>
    this.cloudinary.buildTransformedImage(this.selectedImage().publicId, this.config())
  );

  readonly responsiveCandidates = computed(() =>
    this.cloudinary.buildResponsiveCandidates(this.selectedImage().publicId, this.config())
  );

  readonly responsiveSrcSet = computed(() =>
    this.cloudinary.buildSrcSet(this.selectedImage().publicId, this.config())
  );

  readonly cloudName = this.cloudinary.cloudName;

  constructor() {
    this.measureTrigger$
      .pipe(
        debounceTime(TRANSFORMATION_DEBOUNCE_MS),
        switchMap((request) => this.executeMeasurement(request)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.destroyRef.onDestroy(() => {
      this.activeAbortController?.abort();
      this.metricsService.revokeResultObjectUrls(this.result());
    });

    this.scheduleMeasurement();
  }

  selectCategory(category: ImageCategory | 'all'): void {
    this.selectedCategory.set(category);
  }

  selectImage(asset: DemoImageAsset): void {
    if (asset.id === this.selectedImage().id) {
      return;
    }
    this.selectedImage.set(asset);
    this.scheduleMeasurement();
  }

  setFormat(format: OutputFormat): void {
    this.config.update((current) => ({ ...current, format }));
    this.scheduleMeasurement();
  }

  setQualityMode(qualityMode: QualityMode): void {
    this.config.update((current) => ({ ...current, qualityMode }));
    this.scheduleMeasurement();
  }

  setManualQuality(value: number): void {
    this.config.update((current) => ({
      ...current,
      qualityMode: 'manual',
      manualQuality: clampQuality(value),
    }));
    this.scheduleMeasurement();
  }

  setMaxWidth(maxWidth: MaxWidthOption): void {
    this.config.update((current) => ({ ...current, maxWidth }));
    this.scheduleMeasurement();
  }

  resetSettings(): void {
    this.config.set(DEFAULT_TRANSFORMATION_CONFIG);
    this.scheduleMeasurement();
  }

  retryMeasurement(): void {
    this.scheduleMeasurement();
  }

  private scheduleMeasurement(): void {
    this.status.set('loading');
    this.errorKey.set(null);
    this.measureTrigger$.next({
      originalUrl: this.originalUrl(),
      optimizedUrl: this.optimizedUrl(),
    });
  }

  private async executeMeasurement(request: MeasurementRequest): Promise<void> {
    this.activeAbortController?.abort();
    const controller = new AbortController();
    this.activeAbortController = controller;

    try {
      const measured = await this.metricsService.measureComparison(
        request.originalUrl,
        request.optimizedUrl,
        controller.signal
      );

      if (controller.signal.aborted) {
        this.metricsService.revokeResultObjectUrls(measured);
        return;
      }

      const previous = this.result();
      this.result.set(measured);
      this.status.set('ready');
      this.errorKey.set(null);
      this.metricsService.revokeResultObjectUrls(previous);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      this.status.set('error');
      this.errorKey.set('errors.networkError');
    }
  }
}
