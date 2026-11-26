import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import {
  LucideAlertTriangle,
  LucideInfo,
  LucideImage,
  LucideFileImage,
  LucideHardDrive,
  LucideTrendingDown,
} from '@lucide/angular';

import { LanguageService } from '../../../../core/services/language.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import type {
  LabLoadStatus,
  OptimizationResult,
} from '../../models/optimization-result.model';

import {
  formatBytes,
  formatSignedBytes,
} from '../../utils/bytes.utils';

@Component({
  selector: 'cil-optimization-metrics',
  standalone: true,
  imports: [
    LucideAlertTriangle,
    LucideInfo,
    LucideImage,
    LucideFileImage,
    LucideHardDrive,
    LucideTrendingDown,
    TranslatePipe,
    SkeletonComponent,
  ],
  templateUrl: './optimization-metrics.html',
  styleUrl: './optimization-metrics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizationMetricsComponent {
  private readonly languageService =
    inject(LanguageService);

  readonly result =
    input<OptimizationResult | null>(null);

  readonly status =
    input<LabLoadStatus>('idle');

  protected readonly currentResult = computed(() =>
    this.status() === 'ready'
      ? this.result()
      : null
  );

  protected readonly originalSize = computed(() =>
    formatBytes(
      this.currentResult()?.original.bytes ?? null,
      this.languageService.locale()
    )
  );

  protected readonly optimizedSize = computed(() =>
    formatBytes(
      this.currentResult()?.optimized.bytes ?? null,
      this.languageService.locale()
    )
  );

  protected readonly bytesSavedLabel = computed(() =>
    formatSignedBytes(
      this.currentResult()?.bytesSaved ?? null,
      this.languageService.locale()
    )
  );

  protected readonly reductionLabel = computed(() => {
    const percentage =
      this.currentResult()?.reductionPercentage ?? null;

    if (percentage === null) {
      return null;
    }

    const formatted = this.languageService.formatNumber(
      Math.abs(percentage),
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }
    );

    if (percentage > 0) {
      return `${formatted}%`;
    }

    if (percentage < 0) {
      return `+${formatted}%`;
    }

    return `${formatted}%`;
  });

  protected readonly isPositiveReduction = computed(() =>
    (this.currentResult()?.reductionPercentage ?? 0) > 0
  );

  protected readonly isHeavier = computed(() =>
    this.currentResult()?.isHeavier ?? false
  );

  protected readonly originalDimensions = computed(() => {
    const image = this.currentResult()?.original;

    return image?.width && image?.height
      ? `${image.width} × ${image.height}`
      : null;
  });

  protected readonly optimizedDimensions = computed(() => {
    const image = this.currentResult()?.optimized;

    return image?.width && image?.height
      ? `${image.width} × ${image.height}`
      : null;
  });

  protected readonly hasComparableSizes = computed(() => {
    const result = this.currentResult();

    return (
      result !== null &&
      result.original.bytes !== null &&
      result.optimized.bytes !== null
    );
  });

  private readonly largestSize = computed(() =>
    Math.max(
      this.currentResult()?.original.bytes ?? 0,
      this.currentResult()?.optimized.bytes ?? 0,
      1
    )
  );

  protected readonly originalBarWidth = computed(() =>
    Math.min(
      100,
      Math.max(
        0,
        ((this.currentResult()?.original.bytes ?? 0) /
          this.largestSize()) *
          100
      )
    )
  );

  protected readonly optimizedBarWidth = computed(() =>
    Math.min(
      100,
      Math.max(
        0,
        ((this.currentResult()?.optimized.bytes ?? 0) /
          this.largestSize()) *
          100
      )
    )
  );
}