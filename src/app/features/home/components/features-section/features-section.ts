import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCode2, LucideFileImage, LucideGauge, LucideSlidersHorizontal } from '@lucide/angular';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'cil-features-section',
  standalone: true,
  imports: [LucideFileImage, LucideSlidersHorizontal, LucideGauge, LucideCode2, TranslatePipe],
  templateUrl: './features-section.html',
  styleUrl: './features-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesSectionComponent {}
