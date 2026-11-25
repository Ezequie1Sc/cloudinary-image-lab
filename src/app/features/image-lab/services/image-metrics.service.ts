import { Injectable } from '@angular/core';
import type {
  MeasuredImageResource,
  OptimizationResult,
} from '../models/optimization-result.model';
import {
  calculateReductionPercentage,
  normalizeContentTypeToFormat,
} from '../utils/optimization.utils';

interface CachedMeasurement {
  readonly url: string;
  readonly blob: Blob;
  readonly bytes: number;
  readonly contentType: string | null;
  readonly formatLabel: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

const MAX_CACHE_ENTRIES = 40;

@Injectable({ providedIn: 'root' })
export class ImageMetricsService {
  private readonly cache = new Map<string, CachedMeasurement>();

  async measureComparison(
    originalUrl: string,
    optimizedUrl: string,
    signal?: AbortSignal
  ): Promise<OptimizationResult> {
    const [original, optimized] = await Promise.all([
      this.measureResource(originalUrl, signal),
      this.measureResource(optimizedUrl, signal),
    ]);

    const corsLimited = original.bytes === null || optimized.bytes === null;
    const bytesSaved =
      original.bytes !== null && optimized.bytes !== null
        ? original.bytes - optimized.bytes
        : null;
    const reductionPercentage = calculateReductionPercentage(original.bytes, optimized.bytes);
    const isHeavier = bytesSaved !== null && bytesSaved < 0;
    const includesResizing =
      original.width !== null &&
      optimized.width !== null &&
      (optimized.width !== original.width || optimized.height !== original.height);

    return {
      original,
      optimized,
      bytesSaved,
      reductionPercentage,
      isHeavier,
      includesResizing,
      corsLimited,
    };
  }

  revokeResultObjectUrls(result: OptimizationResult | null): void {
    if (!result) {
      return;
    }
    if (result.original.objectUrl) {
      URL.revokeObjectURL(result.original.objectUrl);
    }
    if (result.optimized.objectUrl) {
      URL.revokeObjectURL(result.optimized.objectUrl);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async measureResource(
    url: string,
    signal?: AbortSignal
  ): Promise<MeasuredImageResource> {
    const cached = this.cache.get(url);
    if (cached) {
      return {
        url: cached.url,
        objectUrl: this.safeCreateObjectUrl(cached.blob),
        bytes: cached.bytes,
        contentType: cached.contentType,
        formatLabel: cached.formatLabel,
        width: cached.width,
        height: cached.height,
      };
    }

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || blob.type || null;
    const formatLabel = normalizeContentTypeToFormat(contentType);
    const objectUrl = this.safeCreateObjectUrl(blob);
    const dimensions = await this.readBlobDimensions(blob, objectUrl);

    const entry: CachedMeasurement = {
      url,
      blob,
      bytes: blob.size,
      contentType,
      formatLabel,
      width: dimensions.width,
      height: dimensions.height,
    };

    this.storeInCache(url, entry);

    return {
      url,
      objectUrl,
      bytes: blob.size,
      contentType,
      formatLabel,
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  private storeInCache(key: string, value: CachedMeasurement): void {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  private safeCreateObjectUrl(blob: Blob): string | null {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return null;
    }
    return URL.createObjectURL(blob);
  }

  private async readBlobDimensions(
    blob: Blob,
    objectUrl: string | null
  ): Promise<{ width: number | null; height: number | null }> {
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(blob);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dimensions;
      } catch {
        // Fallback to HTMLImageElement below.
      }
    }

    if (!objectUrl || typeof Image === 'undefined') {
      return { width: null, height: null };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: null, height: null });
      img.src = objectUrl;
    });
  }
}
