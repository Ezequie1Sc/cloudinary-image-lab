import { InjectionToken } from '@angular/core';
import type { CloudinaryRuntimeConfig } from '../config/cloudinary.config';

export const CLOUDINARY_CONFIG = new InjectionToken<CloudinaryRuntimeConfig>('CLOUDINARY_CONFIG');
