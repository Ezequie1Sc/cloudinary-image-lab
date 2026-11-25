import { describe, expect, it } from 'vitest';
import {
  calculateReductionPercentage,
  clampQuality,
  isValidCloudinaryPublicId,
  normalizeContentTypeToFormat,
} from './optimization.utils';

describe('optimization.utils', () => {
  it('calculates positive reduction percentages', () => {
    expect(calculateReductionPercentage(1000, 250)).toBe(75);
    expect(calculateReductionPercentage(1000, 333)).toBe(66.7);
  });

  it('returns negative percentage when optimized file is heavier', () => {
    expect(calculateReductionPercentage(1000, 1250)).toBe(-25);
  });

  it('guards against division by zero and invalid values', () => {
    expect(calculateReductionPercentage(0, 100)).toBeNull();
    expect(calculateReductionPercentage(-50, 100)).toBeNull();
    expect(calculateReductionPercentage(null, 100)).toBeNull();
    expect(calculateReductionPercentage(100, -1)).toBeNull();
  });

  it('validates Cloudinary public IDs against traversal and injection', () => {
    expect(isValidCloudinaryPublicId('sample')).toBe(true);
    expect(isValidCloudinaryPublicId('docs/parrot-in-tree')).toBe(true);
    expect(isValidCloudinaryPublicId('../secret')).toBe(false);
    expect(isValidCloudinaryPublicId('foo//bar')).toBe(false);
    expect(isValidCloudinaryPublicId('bad id with spaces')).toBe(false);
    expect(isValidCloudinaryPublicId('')).toBe(false);
  });

  it('normalizes MIME Content-Type headers', () => {
    expect(normalizeContentTypeToFormat('image/webp')).toBe('WebP');
    expect(normalizeContentTypeToFormat('image/avif; charset=utf-8')).toBe('AVIF');
    expect(normalizeContentTypeToFormat('image/jpeg')).toBe('JPEG');
    expect(normalizeContentTypeToFormat('image/png')).toBe('PNG');
    expect(normalizeContentTypeToFormat(null)).toBeNull();
  });

  it('clamps manual quality within safe bounds', () => {
    expect(clampQuality(5)).toBe(10);
    expect(clampQuality(120)).toBe(100);
    expect(clampQuality(75.6)).toBe(76);
  });
});
