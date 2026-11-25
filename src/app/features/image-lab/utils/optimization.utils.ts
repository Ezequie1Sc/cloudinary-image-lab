const PUBLIC_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,199}$/;

export function calculateReductionPercentage(
  originalBytes: number | null,
  optimizedBytes: number | null
): number | null {
  if (
    originalBytes === null ||
    optimizedBytes === null ||
    !Number.isFinite(originalBytes) ||
    !Number.isFinite(optimizedBytes) ||
    originalBytes <= 0 ||
    optimizedBytes < 0
  ) {
    return null;
  }

  const raw = ((originalBytes - optimizedBytes) / originalBytes) * 100;
  return Math.round(raw * 10) / 10;
}

export function isValidCloudinaryPublicId(publicId: string): boolean {
  if (!publicId || publicId.includes('..') || publicId.includes('//')) {
    return false;
  }
  return PUBLIC_ID_PATTERN.test(publicId);
}

export function normalizeContentTypeToFormat(contentType: string | null): string | null {
  if (!contentType) {
    return null;
  }

  const mime = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  switch (mime) {
    case 'image/webp':
      return 'WebP';
    case 'image/avif':
      return 'AVIF';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPEG';
    case 'image/png':
      return 'PNG';
    case 'image/gif':
      return 'GIF';
    case 'image/svg+xml':
      return 'SVG';
    default:
      return mime.startsWith('image/') ? mime.replace('image/', '').toUpperCase() : null;
  }
}

export function clampQuality(value: number, min = 10, max = 100): number {
  if (!Number.isFinite(value)) {
    return 80;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}
