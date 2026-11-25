import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from './core/services/language.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

@Component({
  selector: 'cil-root',
  standalone: true,
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
  );

  constructor() {
    effect(() => {
      const currentNav = this.navEnd();
      this.languageService.language();
      this.languageService.loaded();

      const url = currentNav?.urlAfterRedirects ?? this.router.url;
      if (url.startsWith('/docs')) {
        this.languageService.updateRouteMetadata('meta.docsTitle');
      } else if (url.startsWith('/lab')) {
        this.languageService.updateRouteMetadata('meta.labTitle');
      } else {
        this.languageService.updateRouteMetadata('meta.homeTitle');
      }
    });
  }
}
