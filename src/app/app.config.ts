import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideCloudinaryConfig } from './core/providers/cloudinary.provider';
import { LanguageService } from './core/services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      })
    ),
    provideCloudinaryConfig(),
    provideAppInitializer(() => {
      const languageService = inject(LanguageService);
      return languageService.init();
    }),
  ],
};
