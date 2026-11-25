import { Pipe, type PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(key: string): string {
    // Reading signals keeps Angular's reactive template tracking in sync when language changes.
    this.languageService.language();
    this.languageService.loaded();
    return this.languageService.translate(key);
  }
}
