import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideBookOpen } from '@lucide/angular';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'cil-hero',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideBookOpen, TranslatePipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {}
