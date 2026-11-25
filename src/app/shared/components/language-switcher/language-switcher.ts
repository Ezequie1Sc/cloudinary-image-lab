import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideGlobe } from '@lucide/angular';
import { LanguageService, type SupportedLanguage } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'cil-language-switcher',
  standalone: true,
  imports: [LucideGlobe, TranslatePipe],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languageService = inject(LanguageService);

  protected selectLanguage(lang: SupportedLanguage): void {
    void this.languageService.setLanguage(lang);
  }
}
