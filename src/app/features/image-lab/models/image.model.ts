export type ImageCategory = 'nature' | 'architecture' | 'portrait' | 'products' | 'urban';

export interface LocalizedText {
  readonly en: string;
  readonly es: string;
}

export interface DemoImageAsset {
  readonly id: string;
  readonly publicId: string;
  readonly category: ImageCategory;
  readonly title: LocalizedText;
  readonly alt: LocalizedText;
  readonly sourceFormat: string;
  readonly aspectRatio: string;
}
