import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import {
  DEFAULT_CLOUDINARY_CONFIG,
  type CloudinaryRuntimeConfig,
} from '../config/cloudinary.config';
import { CLOUDINARY_CONFIG } from '../tokens/cloudinary-config.token';

export function provideCloudinaryConfig(
  overrides?: Partial<CloudinaryRuntimeConfig>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CLOUDINARY_CONFIG,
      useValue: {
        ...DEFAULT_CLOUDINARY_CONFIG,
        ...overrides,
      },
    },
  ]);
}
