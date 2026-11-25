import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterLink } from '@angular/router';

import { LucideArrowRight, LucideBookOpen } from '@lucide/angular';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import { DarkVeilComponent } from './components/dark-veil/dark-veil';

@Component({
  selector: 'cil-hero',
  standalone: true,

  imports: [RouterLink, LucideArrowRight, LucideBookOpen, TranslatePipe, DarkVeilComponent],

  templateUrl: './hero.html',
  styleUrl: './hero.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {}