import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageDownloadService {
  async download(url: string, filename: string, existingObjectUrl?: string | null): Promise<void> {
    const response = await fetch(existingObjectUrl || url);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();

    if (!blob.size || !blob.type.startsWith('image/')) {
      throw new Error('Invalid image resource');
    }

    const extension = this.resolveExtension(blob.type);

    const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '-');

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = `${safeFilename}.${extension}`;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);

    try {
      anchor.click();
    } finally {
      anchor.remove();

      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  }

  private resolveExtension(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/jxl': 'jxl',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    return extensions[contentType] ?? 'img';
  }
}
