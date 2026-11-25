import { environment } from '../../../environments/environment';

export interface CloudinaryRuntimeConfig {
  readonly cloudName: string;
  readonly secure: boolean;
  readonly deliveryBaseUrl: string;
}

export const DEFAULT_CLOUDINARY_CONFIG: CloudinaryRuntimeConfig = {
  cloudName: environment.cloudinary.cloudName,
  secure: environment.cloudinary.secure,
  deliveryBaseUrl: environment.cloudinary.deliveryBaseUrl,
};
