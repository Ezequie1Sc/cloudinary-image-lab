import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { OUTPUT_FORMAT_OPTIONS, type OutputFormat } from '../../models/transformation.model';

@Component({
  selector: 'cil-format-selector',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './format-selector.html',
  styleUrl: './format-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormatSelectorComponent {
  readonly value = input.required<OutputFormat>();
  readonly valueChange = output<OutputFormat>();

  protected readonly options = OUTPUT_FORMAT_OPTIONS;
}
