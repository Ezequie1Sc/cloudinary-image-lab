import type { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home-page/home-page').then((m) => m.HomePageComponent),
  },
  {
    path: 'lab',
    loadComponent: () =>
      import('./features/image-lab/pages/image-lab-page/image-lab-page').then(
        (m) => m.ImageLabPageComponent
      ),
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./features/documentation/pages/documentation-page/documentation-page').then(
        (m) => m.DocumentationPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
