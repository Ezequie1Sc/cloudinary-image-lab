# Cloudinary Image Lab

**Less weight. Same impact.**

[Leer en Español](./README.es.md)

An interactive, educational Angular 22 web application designed for developers to explore, compare, and measure real Cloudinary image optimization transformations in the browser.

Built by **Orlando Ezequiel Salazar Cruz** ([GitHub](https://github.com/Ezequie1Sc)) as the technical companion for the DEV Community article *"Stop Serving Heavy Images: A Developer's Guide to Cloudinary and Angular"* and as a contribution to the Cloudinary Creators program (Build & Share / Write & Share).

---

## Features

- **Interactive Before & After Comparator**: Smooth pointer, touch, and keyboard-accessible split slider comparing the exact same Cloudinary asset before and after transformation.
- **Real Browser Optimization Metrics**: Measures actual fetched `Blob.size`, `Content-Type`, natural pixel dimensions, bytes saved, and reduction percentage—with honest handling of heavier outputs, CORS limits, and stale request cancellation.
- **Dynamic Transformation Panel**: Configure output format (`f_auto`, `f_webp`, `f_avif`, `f_jpg`, `f_png`), quality (`q_auto`, `q_auto:best`, `q_auto:good`, `q_auto:eco`, `q_auto:low`, or manual `q_10`–`q_100`), and responsive width limits (`c_limit,w_*`).
- **Generated Transformation URL & Code Playground**: Live-synced delivery URL with parameter highlighting plus copyable `URL`, `HTML`, `Angular`, and `TypeScript` snippets using `@cloudinary/url-gen` and `@cloudinary/ng`.
- **Responsive Image Delivery Preview**: Demonstrates `srcset`, `sizes`, and `c_limit,w_*` candidates across Mobile, Tablet, and Desktop viewports.
- **Complete Bilingual i18n (EN / ES)**: Instant language switching without page reload, browser language detection, `localStorage` persistence, `Intl` number formatting, and automated key-parity tests.
- **Vercel / Geist Inspired UI**: Monochromatic dark design system with Geist Sans and Geist Mono self-hosted via Fontsource.

## Technologies

- **Angular 22** (Standalone Components, Signals, `OnPush`, Lazy-loaded routes)
- **TypeScript 6** (`strict` mode)
- **Cloudinary SDKs**: `@cloudinary/url-gen` & `@cloudinary/ng`
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + CSS Design Tokens
- **Lucide Icons** (`@lucide/angular`)
- **Geist Sans & Geist Mono** (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`)
- **Vitest + jsdom** (`@angular/build:unit-test`)
- **ESLint 9 + angular-eslint 22 + Prettier**

## Architecture

Feature-Based Architecture separating global `core/`, reusable `shared/`, `layouts/`, and self-contained `features/` (`home`, `image-lab`, `documentation`). See [docs/architecture.md](./docs/architecture.md) for detailed architectural decisions.

## Installation & Getting Started

### Prerequisites

- **Node.js**: `^22.22.3`, `^24.15.0`, or `^26.0.0` (required by Angular 22)
- **npm**: `>= 10.0.0`

### Local Setup

```bash
npm install
npm start
```

Open `http://localhost:4200` in your browser. The app works out of the box using verified assets on Cloudinary's public `demo` cloud.

## Cloudinary Configuration

All Cloudinary settings are centralized in `src/environments/environment.ts` and `src/environments/environment.prod.ts` via the `CLOUDINARY_CONFIG` injection token. See [docs/cloudinary-setup.md](./docs/cloudinary-setup.md) to switch to your own Cloud Name.

## Internationalization

Translations live in `public/i18n/en.json` and `public/i18n/es.json` and are loaded dynamically by `LanguageService`. Key parity between both languages is verified by `src/app/core/services/language.service.spec.ts`.

## Available Transformations

| Parameter | Options |
| --- | --- |
| Format | `f_auto`, `f_webp`, `f_avif`, `f_jpg`, `f_png` |
| Quality | `q_auto`, `q_auto:best`, `q_auto:good`, `q_auto:eco`, `q_auto:low`, `q_10`–`q_100` |
| Width (`c_limit`) | `320`, `640`, `800`, `1280`, `1920`, or Original |

## Testing & Quality Checks

```bash
npm test          # Vitest unit tests (non-interactive)
npm run lint      # ESLint + Angular template accessibility rules
npm run typecheck # Strict TypeScript verification
npm run build:prod
```

## Deployment (Vercel)

`vercel.json` is preconfigured for Angular 22's `@angular/build:application` output directory (`dist/cloudinary-image-lab/browser`) with SPA fallback rewrites.

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Keep the detected settings (`npm run build:prod`, output `dist/cloudinary-image-lab/browser`).
4. Deploy.

## Security Considerations

- Only the public `cloudName` is present in frontend configuration.
- Zero API Secrets, signed upload credentials, or Admin API tokens exist in the codebase.
- Public IDs are validated against path traversal and unsafe characters before URL generation.

## Known Limitations

- Byte metrics measure decoded `Blob.size` via CORS `fetch()`. If a custom Cloudinary environment restricts CORS headers, metrics gracefully display as *Unavailable*.
- Live optimization benchmark measurements in `docs/optimization-results.md` should be recorded after running the app locally with live internet access.

## License

MIT License — see [LICENSE](./LICENSE).

## Developer

**Orlando Ezequiel Salazar Cruz** — [https://github.com/Ezequie1Sc](https://github.com/Ezequie1Sc)
