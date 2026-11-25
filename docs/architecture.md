# Architecture — Cloudinary Image Lab

## 1. Feature-Based Architecture

The codebase is organized by domain responsibility so every feature remains cohesive, testable, and easy to extend:

- **`src/app/core/`**: Application-wide configuration (`CLOUDINARY_CONFIG` token and provider), static verified constants (`DEMO_IMAGE_ASSETS`, `EXTERNAL_LINKS`), `LanguageService`, and `ToastService`.
- **`src/app/layouts/`**: Persistent shell layout (`MainLayoutComponent`) with skip-to-content link, sticky header, router outlet, footer, and toast container.
- **`src/app/shared/`**: Reusable, domain-agnostic UI primitives (`button`, `skeleton`, `tooltip`, `toast`, `empty-state`, `header`, `footer`, `language-switcher`), `TranslatePipe`, and clipboard utilities.
- **`src/app/features/`**:
  - `home/`: Landing hero, capabilities grid, and educational overview.
  - `image-lab/`: Self-contained workbench with its own `models/`, `utils/`, `services/`, feature-scoped `state/image-lab.store.ts`, `pages/`, and 10 focused components.
  - `documentation/`: Bilingual developer reference with sidebar navigation.

## 2. State Management (Signals + Targeted RxJS)

- **Angular Signals (`signal`, `computed`)** hold synchronous UI state (`selectedImage`, `config`, `status`, `result`, `originalUrl`, `optimizedUrl`, `responsiveSrcSet`).
- **Feature-scoped store**: `ImageLabStore` is provided at `ImageLabPageComponent` level, avoiding unnecessary global state pollution and ensuring Object URLs are automatically revoked when leaving the lab.
- **RxJS (`Subject`, `debounceTime`, `switchMap`)** is used strictly where asynchronous cancellation and debouncing matter (rapidly dragging the manual quality slider or toggling format presets), paired with `AbortController` to abort stale `fetch()` calls.

## 3. Internationalization Strategy

Rather than introducing a third-party i18n library with potential Angular 22 / TypeScript 6 peer-dependency lag, `LanguageService` implements a lightweight, Signal-native dynamic loader backed by `public/i18n/en.json` and `public/i18n/es.json`:
- Zero extra bundle dependencies.
- Instant switching without reload.
- Automatic `document.documentElement.lang`, `<title>`, and `<meta name="description">` synchronization.
- Automated Vitest key-parity verification (`language.service.spec.ts`).

## 4. Representation Consistency in Metrics & Comparator

When a browser requests an `f_auto` URL via `fetch()` vs. `<img src>`, `Accept` headers can occasionally differ. `ImageMetricsService` downloads each resource once via `fetch()`, measures `blob.size` and `Content-Type`, creates an `ObjectURL`, and hands that exact `ObjectURL` to `ImageComparatorComponent`—guaranteeing visual and byte parity while revoking previous Object URLs to prevent memory leaks.
