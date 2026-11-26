import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideExternalLink } from '@lucide/angular';

import { EXTERNAL_LINKS } from '../../../core/constants/external-links.constant';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'cil-footer',
  standalone: true,
  imports: [RouterLink, LucideExternalLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly externalLinks = EXTERNAL_LINKS;

  protected readonly developerName = 'Orlando Ezequiel Salazar Cruz';

  protected readonly currentYear = new Date().getFullYear();

  protected readonly repositoryUrl = 'https://github.com/Ezequie1Sc/cloudinary-image-lab';

  protected readonly technologies = [
    {
      label: 'Cloudinary',
      url: 'https://cloudinary.com/',
    },
    {
      label: 'Angular',
      url: 'https://angular.dev/',
    },
    {
      label: 'Tailwind CSS',
      url: 'https://tailwindcss.com/',
    },
    {
      label: 'Shiki',
      url: 'https://shiki.style/',
    },
  ] as const;

  protected readonly wavePaths = Array.from({ length: 28 }, (_, index) => {
    const offset = index * 13;

    return [
      `M -100 ${180 + offset}`,
      `C 180 ${-40 + offset}`,
      `420 ${420 + offset}`,
      `720 ${210 + offset}`,
      `S 1180 ${20 + offset}`,
      `1540 ${230 + offset}`,
    ].join(' ');
  });

  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      return;
    }

    const host = this.elementRef.nativeElement;
    const rect = host.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));

    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

    host.style.setProperty('--footer-pointer-x', `${x}%`);

    host.style.setProperty('--footer-pointer-y', `${y}%`);
  }

  protected onPointerLeave(): void {
    const host = this.elementRef.nativeElement;

    host.style.setProperty('--footer-pointer-x', '50%');

    host.style.setProperty('--footer-pointer-y', '30%');
  }
}
