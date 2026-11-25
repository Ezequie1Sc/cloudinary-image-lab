import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCheck } from '@lucide/angular';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'cil-educational-section',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideCheck, TranslatePipe],
  templateUrl: './educational-section.html',
  styleUrl: './educational-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationalSectionComponent {}
