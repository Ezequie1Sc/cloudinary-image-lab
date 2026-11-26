import type { DemoImageAsset } from '../../features/image-lab/models/image.model';

/**
 * Verified public assets hosted on Cloudinary's official public `demo` cloud
 * (https://res.cloudinary.com/demo/image/upload/).
 * Replace these publicIds when switching to a private Cloudinary Cloud Name.
 */
export const DEMO_IMAGE_ASSETS: readonly DemoImageAsset[] = [
  {
    id: 'nature-sample',
    publicId: 'sample',
    category: 'nature',
    title: {
      en: 'Botanical Bloom',
      es: 'Floración botánica',
    },
    alt: {
      en: 'Close-up photograph of vibrant botanical flowers hosted on Cloudinary demo cloud',
      es: 'Fotografía en primer plano de flores botánicas alojada en el cloud demo de Cloudinary',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
  {
  id: 'nature-mountain',
  publicId: 'cld-sample-2',
  category: 'nature',
  title: {
    en: 'Mountain Landscape',
    es: 'Paisaje montañoso',
  },
  alt: {
    en: 'Mountain landscape with natural textures and fine details',
    es: 'Paisaje montañoso con texturas naturales y detalles finos',
  },
  sourceFormat: 'jpg',
  aspectRatio: '3 / 2',
},
  {
    id: 'architecture-vieste',
    publicId: 'vieste_italy',
    category: 'architecture',
    title: {
      en: 'Vieste Coastal Town',
      es: 'Arquitectura costera de Vieste',
    },
    alt: {
      en: 'Historic coastal white stone buildings overlooking the sea in Vieste, Italy',
      es: 'Edificios históricos de piedra blanca frente al mar en Vieste, Italia',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
  {
    id: 'architecture-lounge',
    publicId: 'docs/dup/lounge_q80jpg',
    category: 'architecture',
    title: {
      en: 'Architectural Lounge',
      es: 'Salón arquitectónico',
    },
    alt: {
      en: 'Modern minimalist architectural lounge interior with natural lighting',
      es: 'Interior de salón arquitectónico minimalista con iluminación natural',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
  {
    id: 'portrait-profile',
    publicId: 'docs/profile-pic',
    category: 'portrait',
    title: {
      en: 'Editorial Portrait',
      es: 'Retrato editorial',
    },
    alt: {
      en: 'Sharp portrait photograph demonstrating skin tone preservation under compression',
      es: 'Retrato nítido que demuestra la conservación de tonos de piel bajo compresión',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
  {
    id: 'products-camera',
    publicId: 'docs/camera-640',
    category: 'products',
    title: {
      en: 'Studio Camera',
      es: 'Cámara de estudio',
    },
    alt: {
      en: 'Product photography of a black camera body and lens',
      es: 'Fotografía de producto de una cámara fotográfica negra y su lente',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
  {
    id: 'urban-scene',
    publicId: 'cld-sample',
    category: 'urban',
    title: {
      en: 'Urban Street Lifestyle',
      es: 'Escena urbana contemporánea',
    },
    alt: {
      en: 'High-detail urban lifestyle scene with varied textures and lighting',
      es: 'Escena urbana de alto detalle con texturas e iluminación variadas',
    },
    sourceFormat: 'jpg',
    aspectRatio: '3 / 2',
  },
];
