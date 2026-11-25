import { Injectable, inject } from '@angular/core';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { fill, limitFit } from '@cloudinary/url-gen/actions/resize';
import { auto as autoFormat, avif, jpeg, png, webp } from '@cloudinary/url-gen/qualifiers/format';
import {
  auto as autoQuality,
  autoBest,
  autoEco,
  autoGood,
  autoLow,
} from '@cloudinary/url-gen/qualifiers/quality';

import { CLOUDINARY_CONFIG } from '../../../core/tokens/cloudinary-config.token';
import {
  RESPONSIVE_CANDIDATE_WIDTHS,
  type OutputFormat,
  type QualityMode,
  type TransformationConfig,
} from '../models/transformation.model';
import { clampQuality, isValidCloudinaryPublicId } from '../utils/optimization.utils';

export interface ResponsiveCandidate {
  readonly width: number;
  readonly url: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly config = inject(CLOUDINARY_CONFIG);

  private readonly cld = new Cloudinary({
    cloud: {
      cloudName: this.config.cloudName,
    },
    url: {
      secure: this.config.secure,
      analytics: false,
    },
  });

  get cloudName(): string {
    return this.config.cloudName;
  }

  buildOriginalImage(publicId: string): CloudinaryImage {
    this.assertValidPublicId(publicId);

    return this.cld.image(publicId);
  }

  buildOriginalUrl(publicId: string): string {
    return this.buildOriginalImage(publicId).toURL();
  }

  buildTransformedImage(publicId: string, config: TransformationConfig): CloudinaryImage {
    this.assertValidPublicId(publicId);

    const image = this.cld.image(publicId);

    if (config.maxWidth !== null) {
      image.resize(limitFit().width(config.maxWidth));
    }

    image.delivery(this.resolveQualityAction(config.qualityMode, config.manualQuality));

    image.delivery(this.resolveFormatAction(config.format));

    return image;
  }

  buildTransformedUrl(publicId: string, config: TransformationConfig): string {
    return this.buildTransformedImage(publicId, config).toURL();
  }

  buildThumbnailUrl(publicId: string, width = 240, height = 160): string {
    this.assertValidPublicId(publicId);

    return this.cld
      .image(publicId)
      .resize(fill().width(width).height(height))
      .delivery(quality(autoQuality()))
      .delivery(format(autoFormat()))
      .toURL();
  }

  buildResponsiveCandidates(
    publicId: string,
    config: TransformationConfig
  ): readonly ResponsiveCandidate[] {
    this.assertValidPublicId(publicId);

    return RESPONSIVE_CANDIDATE_WIDTHS.map((width) => ({
      width,
      url: this.buildTransformedUrl(publicId, {
        ...config,
        maxWidth: width as TransformationConfig['maxWidth'],
      }),
    }));
  }

  buildSrcSet(publicId: string, config: TransformationConfig): string {
    return this.buildResponsiveCandidates(publicId, config)
      .map((candidate) => `${candidate.url} ${candidate.width}w`)
      .join(',\n');
  }

  getFormatToken(outputFormat: OutputFormat): string {
    return `f_${outputFormat}`;
  }

  getQualityToken(mode: QualityMode, manualQuality: number): string {
    if (mode === 'manual') {
      return `q_${clampQuality(manualQuality)}`;
    }

    return `q_${mode}`;
  }

  private resolveFormatAction(outputFormat: OutputFormat): ReturnType<typeof format> {
    switch (outputFormat) {
      case 'webp':
        return format(webp());

      case 'avif':
        return format(avif());

      case 'jpg':
        return format(jpeg());

      case 'png':
        return format(png());

      case 'auto':
      default:
        return format(autoFormat());
    }
  }

  private resolveQualityAction(
    mode: QualityMode,
    manualQuality: number
  ): ReturnType<typeof quality> {
    switch (mode) {
      case 'auto:best':
        return quality(autoBest());

      case 'auto:good':
        return quality(autoGood());

      case 'auto:eco':
        return quality(autoEco());

      case 'auto:low':
        return quality(autoLow());

      case 'manual':
        return quality(clampQuality(manualQuality));

      case 'auto':
      default:
        return quality(autoQuality());
    }
  }

  private assertValidPublicId(publicId: string): void {
    if (!isValidCloudinaryPublicId(publicId)) {
      throw new Error(`Invalid Cloudinary public ID: ${publicId}`);
    }
  }
}
