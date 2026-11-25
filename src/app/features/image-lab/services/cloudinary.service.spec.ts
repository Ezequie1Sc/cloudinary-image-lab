import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CLOUDINARY_CONFIG } from '../../../core/tokens/cloudinary-config.token';
import { DEFAULT_TRANSFORMATION_CONFIG } from '../models/transformation.model';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  const createService = (cloudName = 'demo'): CloudinaryService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: CLOUDINARY_CONFIG,
          useValue: {
            cloudName,
            secure: true,
            deliveryBaseUrl: 'https://res.cloudinary.com',
          },
        },
      ],
    });
    return TestBed.inject(CloudinaryService);
  };

  it('generates original and default transformed URLs', () => {
    const service = createService('demo');
    expect(service.buildOriginalUrl('sample')).toBe(
      'https://res.cloudinary.com/demo/image/upload/sample'
    );

    const url = service.buildTransformedUrl('sample', DEFAULT_TRANSFORMATION_CONFIG);
    expect(url).toContain('https://res.cloudinary.com/demo/image/upload/');
    expect(url).toContain('c_limit,w_800');
    expect(url).toContain('q_auto');
    expect(url).toContain('f_auto');
    expect(url.endsWith('/sample')).toBe(true);
  });

  it('applies explicit formats, quality presets, and manual quality', () => {
    const service = createService('custom-cloud');
    const url = service.buildTransformedUrl('docs/profile-pic', {
      format: 'avif',
      qualityMode: 'manual',
      manualQuality: 72,
      maxWidth: 1280,
    });

    expect(url).toContain('https://res.cloudinary.com/custom-cloud/image/upload/');
    expect(url).toContain('c_limit,w_1280');
    expect(url).toContain('q_72');
    expect(url).toContain('f_avif');
  });

  it('omits resize transformation when maxWidth is null (original)', () => {
    const service = createService('demo');
    const url = service.buildTransformedUrl('sample', {
      format: 'webp',
      qualityMode: 'auto:eco',
      manualQuality: 80,
      maxWidth: null,
    });

    expect(url).not.toContain('c_limit');
    expect(url).toContain('q_auto:eco');
    expect(url).toContain('f_webp');
  });

  it('rejects invalid public IDs', () => {
    const service = createService('demo');
    expect(() => service.buildOriginalUrl('../invalid')).toThrow();
  });
});
