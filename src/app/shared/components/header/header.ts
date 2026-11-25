import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCloud, LucideExternalLink, LucideMenu, LucideX } from '@lucide/angular';
import { EXTERNAL_LINKS } from '../../../core/constants/external-links.constant';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';

@Component({
  selector: 'cil-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideCloud,
    LucideExternalLink,
    LucideMenu,
    LucideX,
    TranslatePipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly externalLinks = EXTERNAL_LINKS;
  protected readonly mobileMenuOpen = signal<boolean>(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
