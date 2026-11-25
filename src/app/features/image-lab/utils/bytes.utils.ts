const KB = 1024;
const MB = KB * 1024;

export function formatBytes(bytes: number | null, locale = 'en-US'): string | null {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) {
    return null;
  }

  if (bytes < KB) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(bytes)} B`;
  }

  if (bytes < MB) {
    const value = bytes / KB;
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value)} KB`;
  }

  const value = bytes / MB;
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} MB`;
}

export function formatSignedBytes(bytes: number | null, locale = 'en-US'): string | null {
  if (bytes === null || !Number.isFinite(bytes)) {
    return null;
  }

  const formattedAbs = formatBytes(Math.abs(bytes), locale);
  if (!formattedAbs) {
    return null;
  }

  if (bytes > 0) {
    return `-${formattedAbs}`;
  }
  if (bytes < 0) {
    return `+${formattedAbs}`;
  }
  return formattedAbs;
}
