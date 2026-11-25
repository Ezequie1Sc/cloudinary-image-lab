import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,

  cloudinary: {
    cloudName: 'demo',
    secure: true,
    deliveryBaseUrl: 'https://res.cloudinary.com',
  },
};
