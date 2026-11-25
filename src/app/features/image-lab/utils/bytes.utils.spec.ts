import { describe, expect, it } from 'vitest';
import { formatBytes, formatSignedBytes } from './bytes.utils';

describe('bytes.utils', () => {
  it('formats bytes, kilobytes, and megabytes', () => {
    expect(formatBytes(512, 'en-US')).toBe('512 B');
    expect(formatBytes(2048, 'en-US')).toBe('2.0 KB');
    expect(formatBytes(1_572_864, 'en-US')).toBe('1.50 MB');
  });

  it('returns null for invalid or null inputs', () => {
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(-10)).toBeNull();
    expect(formatBytes(Number.NaN)).toBeNull();
  });

  it('formats signed byte differences clearly', () => {
    expect(formatSignedBytes(1024, 'en-US')).toBe('-1.0 KB');
    expect(formatSignedBytes(-1024, 'en-US')).toBe('+1.0 KB');
    expect(formatSignedBytes(0, 'en-US')).toBe('0 B');
    expect(formatSignedBytes(null)).toBeNull();
  });
});
