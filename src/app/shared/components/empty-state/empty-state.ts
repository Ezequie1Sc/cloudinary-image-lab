import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideImageOff } from '@lucide/angular';

@Component({
  selector: 'cil-empty-state',
  standalone: true,
  imports: [LucideImageOff],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
