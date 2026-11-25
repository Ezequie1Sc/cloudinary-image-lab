import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cil-tooltip',
  standalone: true,
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  readonly text = input.required<string>();
}
