import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { MAX_WIDTH_OPTIONS, type MaxWidthOption } from '../../models/transformation.model';

@Component({
  selector: 'cil-dimension-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dimension-selector.html',
  styleUrl: './dimension-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DimensionSelectorComponent {
  readonly value = input.required<MaxWidthOption>();
  readonly valueChange = output<MaxWidthOption>();

  protected readonly options = MAX_WIDTH_OPTIONS;
  protected readonly tokenLabel = computed(() =>
    this.value() === null ? 'original' : `c_limit,w_${this.value()}`
  );
}
