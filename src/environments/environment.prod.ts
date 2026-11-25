import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,

  cloudinary: {
    cloudName: 'demo',
    secure: true,
    deliveryBaseUrl: 'https://res.cloudinary.com',
  },
};
