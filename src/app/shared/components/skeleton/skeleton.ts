import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'cil-skeleton',
  standalone: true,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly height = input<string>('1rem');
  readonly width = input<string>('100%');
  readonly rounded = input<string>('6px');
}
