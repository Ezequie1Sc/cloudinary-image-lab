import { afterEach, describe, expect, it, vi } from 'vitest';
import { ImageMetricsService } from './image-metrics.service';

function createImageResponse(size: number, contentType: string): Response {
  return new Response(new Uint8Array(size), {
    status: 200,
    headers: {
      'content-type': contentType,
    },
  });
}

describe('ImageMetricsService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures real Blob sizes and detects positive reduction', async () => {
    const service = new ImageMetricsService();

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      return url.includes('f_auto')
        ? createImageResponse(250, 'image/webp')
        : createImageResponse(1000, 'image/jpeg');
    });

    const result = await service.measureComparison(
      'https://res.cloudinary.com/demo/image/upload/sample',
      'https://res.cloudinary.com/demo/image/upload/q_auto/f_auto/sample'
    );

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result.original.bytes).toBe(1000);
    expect(result.optimized.bytes).toBe(250);
    expect(result.bytesSaved).toBe(750);
    expect(result.reductionPercentage).toBe(75);
    expect(result.isHeavier).toBe(false);
    expect(result.optimized.formatLabel).toBe('WebP');

    service.revokeResultObjectUrls(result);
  });

  it('flags heavier optimized files accurately', async () => {
    const service = new ImageMetricsService();

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      return String(input).includes('f_png')
        ? createImageResponse(900, 'image/png')
        : createImageResponse(400, 'image/jpeg');
    });

    const result = await service.measureComparison(
      'https://res.cloudinary.com/demo/image/upload/sample',
      'https://res.cloudinary.com/demo/image/upload/f_png/sample'
    );

    expect(result.isHeavier).toBe(true);
    expect(result.reductionPercentage).toBe(-125);

    service.revokeResultObjectUrls(result);
  });

  it('propagates AbortError when cancelled', async () => {
    const service = new ImageMetricsService();
    const controller = new AbortController();

    controller.abort();

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    await expect(
      service.measureComparison('https://a.test/1', 'https://a.test/2', controller.signal)
    ).rejects.toThrow();
  });
});
