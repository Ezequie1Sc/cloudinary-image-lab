import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  MAX_MANUAL_QUALITY,
  MIN_MANUAL_QUALITY,
  QUALITY_MODE_OPTIONS,
  type QualityMode,
} from '../../models/transformation.model';

@Component({
  selector: 'cil-quality-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './quality-selector.html',
  styleUrl: './quality-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualitySelectorComponent {
  readonly mode = input.required<QualityMode>();
  readonly manualQuality = input.required<number>();

  readonly modeChange = output<QualityMode>();
  readonly manualQualityChange = output<number>();

  protected readonly options = QUALITY_MODE_OPTIONS;
  protected readonly minQuality = MIN_MANUAL_QUALITY;
  protected readonly maxQuality = MAX_MANUAL_QUALITY;

  protected readonly tokenLabel = computed(() =>
    this.mode() === 'manual' ? `q_${this.manualQuality()}` : `q_${this.mode()}`
  );

  protected onSliderInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    const parsed = Number(target.value);
    if (Number.isFinite(parsed)) {
      this.manualQualityChange.emit(parsed);
    }
  }
}
