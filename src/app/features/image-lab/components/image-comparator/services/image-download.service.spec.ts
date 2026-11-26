import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageDownloadService } from './image-download.service';

const IMAGE_URL = 'https://res.cloudinary.com/demo/image/upload/sample';

const GENERATED_OBJECT_URL = 'blob:generated-image';

describe('ImageDownloadService', () => {
  let service: ImageDownloadService;

  const fetchMock = vi.fn();
  const createObjectURLMock = vi.fn();
  const revokeObjectURLMock = vi.fn();

  let downloadedFilename: string;
  let downloadedHref: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(ImageDownloadService);

    vi.useFakeTimers();

    fetchMock.mockReset();
    createObjectURLMock.mockReset();
    revokeObjectURLMock.mockReset();

    createObjectURLMock.mockReturnValue(GENERATED_OBJECT_URL);

    downloadedFilename = '';
    downloadedHref = '';

    vi.stubGlobal('fetch', fetchMock);

    const NativeURL = globalThis.URL;

    class MockURL extends NativeURL {
      static override createObjectURL(object: Blob | MediaSource): string {
        return createObjectURLMock(object);
      }

      static override revokeObjectURL(url: string): void {
        revokeObjectURLMock(url);
      }
    }

    vi.stubGlobal('URL', MockURL);

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloadedFilename = this.download;
      downloadedHref = this.href;
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function mockImageResponse(contentType: string, content = 'image-content'): Blob {
    const blob = new Blob([content], {
      type: contentType,
    });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(blob),
    });

    return blob;
  }

  it('creates the image download service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches the requested image URL', async () => {
    mockImageResponse('image/jpeg');

    await service.download(IMAGE_URL, 'sample');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL);
  });

  it('uses an existing object URL when available', async () => {
    mockImageResponse('image/webp');

    await service.download(IMAGE_URL, 'sample', 'blob:existing-image');

    expect(fetchMock).toHaveBeenCalledWith('blob:existing-image');
  });

  it('uses the remote URL when the object URL is null', async () => {
    mockImageResponse('image/jpeg');

    await service.download(IMAGE_URL, 'sample', null);

    expect(fetchMock).toHaveBeenCalledWith(IMAGE_URL);
  });

  it('creates a downloadable object URL from the image blob', async () => {
    const blob = mockImageResponse('image/png');

    await service.download(IMAGE_URL, 'sample');

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);

    expect(downloadedHref).toBe(GENERATED_OBJECT_URL);
  });

  it.each([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/avif', 'avif'],
    ['image/jxl', 'jxl'],
    ['image/gif', 'gif'],
    ['image/svg+xml', 'svg'],
    ['image/bmp', 'bmp'],
    ['image/tiff', 'tiff'],
    ['image/heic', 'heic'],
    ['image/heif', 'heif'],
  ])('uses the correct file extension for %s', async (contentType, extension) => {
    mockImageResponse(contentType);

    await service.download(IMAGE_URL, 'sample');

    expect(downloadedFilename).toBe(`sample.${extension}`);
  });

  it('uses a generic extension for unknown image formats', async () => {
    mockImageResponse('image/custom');

    await service.download(IMAGE_URL, 'sample');

    expect(downloadedFilename).toBe('sample.img');
  });

  it('sanitizes the requested filename', async () => {
    mockImageResponse('image/jpeg');

    await service.download(IMAGE_URL, 'my image/test');

    expect(downloadedFilename).toBe('my-image-test.jpg');
  });

  it('rejects unsuccessful HTTP responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(service.download(IMAGE_URL, 'sample')).rejects.toThrow('Download failed: 404');

    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it('rejects empty image resources', async () => {
    mockImageResponse('image/jpeg', '');

    await expect(service.download(IMAGE_URL, 'sample')).rejects.toThrow('Invalid image resource');

    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it('rejects non-image resources', async () => {
    mockImageResponse('text/html');

    await expect(service.download(IMAGE_URL, 'sample')).rejects.toThrow('Invalid image resource');

    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it('propagates network failures', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'));

    await expect(service.download(IMAGE_URL, 'sample')).rejects.toThrow('Network failure');
  });

  it('removes the temporary download anchor', async () => {
    mockImageResponse('image/jpeg');

    await service.download(IMAGE_URL, 'sample');

    expect(document.querySelector('a[download="sample.jpg"]')).toBeNull();
  });

  it('revokes the generated object URL after one second', async () => {
    mockImageResponse('image/jpeg');

    await service.download(IMAGE_URL, 'sample');

    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(999);

    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);

    expect(revokeObjectURLMock).toHaveBeenCalledWith(GENERATED_OBJECT_URL);
  });

  it('does not revoke the original existing object URL', async () => {
    mockImageResponse('image/webp');

    await service.download(IMAGE_URL, 'sample', 'blob:existing-image');

    vi.advanceTimersByTime(1000);

    expect(revokeObjectURLMock).not.toHaveBeenCalledWith('blob:existing-image');

    expect(revokeObjectURLMock).toHaveBeenCalledWith(GENERATED_OBJECT_URL);
  });
});
