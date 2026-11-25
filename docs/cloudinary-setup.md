# Cloudinary Setup & Configuration

## Default Demo Configuration

Out of the box, Cloudinary Image Lab uses Cloudinary's public `demo` cloud:

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  cloudinary: {
    cloudName: 'demo',
    secure: true,
    deliveryBaseUrl: 'https://res.cloudinary.com',
  },
};
```

## Switching to Your Own Cloud Name

1. Sign in to the [Cloudinary Console](https://cloudinary.com/console) and copy your **Cloud Name** (public identifier).
2. Update `cloudName` in both `src/environments/environment.ts` and `src/environments/environment.prod.ts`.
3. Upload your own images to your Media Library and update `DEMO_IMAGE_ASSETS` in `src/app/core/constants/demo-images.constant.ts` with your verified `publicId` values.

## Official SDKs & Angular 22 Compatibility Note

The project declares both official packages in `package.json`:
- `@cloudinary/url-gen` (`^1.22.0`) — framework-agnostic URL & transformation builder used directly by `CloudinaryService`.
- `@cloudinary/ng` (`^2.1.6`) — official Angular rendering wrapper demonstrated in the Code Playground (`<advanced-image>`).

> **Peer Dependency Note**: Because Angular 22 was released in June 2026 and `@cloudinary/ng@2.1.6` may specify an older `@angular/core` peer dependency range depending on the latest patch published to npm, `CloudinaryService` delegates core URL construction to `@cloudinary/url-gen` (which has zero Angular peer dependencies). If npm reports a peer-dependency warning for `@cloudinary/ng` on Angular 22, check for a newer `@cloudinary/ng` release before installing—do not silence incompatibilities blindly.

## Security Guidelines

- Never add `CLOUDINARY_API_SECRET` or Admin API keys to Angular environment files.
- Client-side uploads are intentionally excluded from v1. If added later, require either a restricted **unsigned upload preset** (folder, format, and max-size locked in Cloudinary Console) or a dedicated backend endpoint that issues short-lived signed upload parameters.
