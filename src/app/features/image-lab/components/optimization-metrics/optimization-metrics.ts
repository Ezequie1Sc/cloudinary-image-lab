import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideAlertTriangle, LucideInfo } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { LabLoadStatus, OptimizationResult } from '../../models/optimization-result.model';
import { formatBytes, formatSignedBytes } from '../../utils/bytes.utils';

@Component({
  selector: 'cil-optimization-metrics',
  standalone: true,
  imports: [LucideAlertTriangle, LucideInfo, TranslatePipe, SkeletonComponent],
  templateUrl: './optimization-metrics.html',
  styleUrl: './optimization-metrics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizationMetricsComponent {
  private readonly languageService = inject(LanguageService);

  readonly result = input<OptimizationResult | null>(null);
  readonly status = input<LabLoadStatus>('idle');

  protected readonly originalSize = computed(() =>
    formatBytes(this.result()?.original.bytes ?? null, this.languageService.locale())
  );

  protected readonly optimizedSize = computed(() =>
    formatBytes(this.result()?.optimized.bytes ?? null, this.languageService.locale())
  );

  protected readonly bytesSavedLabel = computed(() =>
    formatSignedBytes(this.result()?.bytesSaved ?? null, this.languageService.locale())
  );

  protected readonly reductionLabel = computed(() => {
    const pct = this.result()?.reductionPercentage ?? null;
    if (pct === null) {
      return null;
    }
    const formatted = this.languageService.formatNumber(Math.abs(pct), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    if (pct > 0) {
      return `-${formatted}%`;
    }
    if (pct < 0) {
      return `+${formatted}%`;
    }
    return '0.0%';
  });

  protected readonly isPositiveReduction = computed(() => {
    const pct = this.result()?.reductionPercentage ?? null;
    return pct !== null && pct > 0;
  });

  protected readonly originalDimensions = computed(() => {
    const orig = this.result()?.original;
    return orig?.width && orig?.height ? `${orig.width} × ${orig.height}` : null;
  });

  protected readonly optimizedDimensions = computed(() => {
    const opt = this.result()?.optimized;
    return opt?.width && opt?.height ? `${opt.width} × ${opt.height}` : null;
  });
}
