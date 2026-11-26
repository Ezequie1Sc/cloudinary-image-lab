import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEMO_IMAGE_ASSETS } from '../../../../core/constants/demo-images.constant';

import { ImageComparatorComponent } from './image-comparator';
import { ImageDownloadService } from './services/image-download.service';

const ORIGINAL_URL = 'https://res.cloudinary.com/demo/image/upload/sample';

const OPTIMIZED_URL = 'https://res.cloudinary.com/demo/image/upload/q_auto/f_auto/sample';

describe('ImageComparatorComponent', () => {
  let fixture: ComponentFixture<ImageComparatorComponent>;
  let root: HTMLElement;

  const downloadMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    downloadMock.mockReset();
    downloadMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [ImageComparatorComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ImageDownloadService,
          useValue: {
            download: downloadMock,
          },
        },
      ],
    });

    fixture = TestBed.createComponent(ImageComparatorComponent);

    fixture.componentRef.setInput('asset', DEMO_IMAGE_ASSETS[0]);
    fixture.componentRef.setInput('originalUrl', ORIGINAL_URL);
    fixture.componentRef.setInput('optimizedUrl', OPTIMIZED_URL);

    fixture.detectChanges();

    root = fixture.nativeElement as HTMLElement;
  });

  function query<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    return element;
  }

  function modeButtons(): HTMLButtonElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.cil-mode-button'));
  }

  function zoomButtons(): HTMLButtonElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.cil-zoom-controls button'));
  }

  function downloadButtons(): HTMLButtonElement[] {
    return Array.from(root.querySelectorAll<HTMLButtonElement>('.cil-download-button'));
  }

  function selectMode(index: number): void {
    modeButtons()[index].click();
    fixture.detectChanges();
  }

  function pressSliderKey(key: string): void {
    query<HTMLElement>('[role="slider"]').dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
      })
    );

    fixture.detectChanges();
  }

  function zoomValue(): string {
    return query<HTMLElement>('.cil-zoom-value').textContent?.trim() ?? '';
  }

  it('creates the image comparator', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts in slider comparison mode', () => {
    expect(modeButtons()).toHaveLength(4);

    expect(modeButtons()[0].getAttribute('aria-pressed')).toBe('true');

    expect(root.querySelector('[role="slider"]')).not.toBeNull();
  });

  it('starts with the slider at 50 percent', () => {
    const slider = query<HTMLElement>('[role="slider"]');

    expect(slider.getAttribute('aria-valuenow')).toBe('50');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
  });

  it('moves the slider with keyboard arrows', () => {
    pressSliderKey('ArrowRight');

    expect(query<HTMLElement>('[role="slider"]').getAttribute('aria-valuenow')).toBe('55');

    pressSliderKey('ArrowLeft');

    expect(query<HTMLElement>('[role="slider"]').getAttribute('aria-valuenow')).toBe('50');
  });

  it('respects the slider minimum boundary', () => {
    pressSliderKey('Home');
    pressSliderKey('ArrowLeft');

    expect(query<HTMLElement>('[role="slider"]').getAttribute('aria-valuenow')).toBe('0');
  });

  it('respects the slider maximum boundary', () => {
    pressSliderKey('End');
    pressSliderKey('ArrowRight');

    expect(query<HTMLElement>('[role="slider"]').getAttribute('aria-valuenow')).toBe('100');
  });

  it('switches to side-by-side comparison mode', () => {
    selectMode(1);

    expect(root.querySelector('.cil-side-by-side')).not.toBeNull();

    expect(root.querySelectorAll('.cil-image-pane')).toHaveLength(2);

    expect(root.querySelector('[role="slider"]')).toBeNull();

    expect(modeButtons()[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('displays only the original image in original mode', () => {
    selectMode(2);

    const images = root.querySelectorAll<HTMLImageElement>('.cil-stage-img');

    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe(ORIGINAL_URL);

    expect(root.querySelector('.cil-badge--left')).not.toBeNull();

    expect(root.querySelector('.cil-badge--right')).toBeNull();
  });

  it('displays only the optimized image in optimized mode', () => {
    selectMode(3);

    const images = root.querySelectorAll<HTMLImageElement>('.cil-stage-img');

    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toBe(OPTIMIZED_URL);

    expect(root.querySelector('.cil-badge--left')).toBeNull();

    expect(root.querySelector('.cil-badge--right')).not.toBeNull();
  });

  it('returns to slider comparison mode', () => {
    selectMode(1);
    selectMode(0);

    expect(root.querySelector('[role="slider"]')).not.toBeNull();

    expect(root.querySelectorAll('.cil-stage-img')).toHaveLength(2);
  });

  it('starts at 100 percent zoom', () => {
    expect(zoomValue()).toBe('100%');
    expect(zoomButtons()[0].disabled).toBe(true);
    expect(zoomButtons()[1].disabled).toBe(false);
  });

  it('increases zoom by 25 percent', () => {
    zoomButtons()[1].click();
    fixture.detectChanges();

    expect(zoomValue()).toBe('125%');

    expect(root.querySelector('.cil-stage--zoomed')).not.toBeNull();
  });

  it('decreases zoom by 25 percent', () => {
    zoomButtons()[1].click();
    fixture.detectChanges();

    zoomButtons()[0].click();
    fixture.detectChanges();

    expect(zoomValue()).toBe('100%');
  });

  it('does not exceed 400 percent zoom', () => {
    for (let index = 0; index < 20; index++) {
      zoomButtons()[1].click();
      fixture.detectChanges();
    }

    expect(zoomValue()).toBe('400%');
    expect(zoomButtons()[1].disabled).toBe(true);
  });

  it('does not zoom below 100 percent', () => {
    zoomButtons()[0].click();
    fixture.detectChanges();

    expect(zoomValue()).toBe('100%');
    expect(zoomButtons()[0].disabled).toBe(true);
  });

  it('resets zoom and slider position', () => {
    zoomButtons()[1].click();
    fixture.detectChanges();

    pressSliderKey('End');

    query<HTMLButtonElement>('.cil-reset-button').click();
    fixture.detectChanges();

    expect(zoomValue()).toBe('100%');

    expect(query<HTMLElement>('[role="slider"]').getAttribute('aria-valuenow')).toBe('50');
  });

  it('resets zoom when switching comparison modes', () => {
    zoomButtons()[1].click();
    fixture.detectChanges();

    expect(zoomValue()).toBe('125%');

    selectMode(1);

    expect(zoomValue()).toBe('100%');
  });

  it('displays a loading overlay while measuring images', () => {
    fixture.componentRef.setInput('status', 'loading');
    fixture.detectChanges();

    expect(root.querySelector('.cil-loading-overlay')).not.toBeNull();
  });

  it('disables downloads while loading', () => {
    fixture.componentRef.setInput('status', 'loading');
    fixture.detectChanges();

    expect(downloadButtons()[0].disabled).toBe(true);
    expect(downloadButtons()[1].disabled).toBe(true);
  });

  it('enables downloads when images are ready', () => {
    fixture.componentRef.setInput('status', 'ready');
    fixture.detectChanges();

    expect(downloadButtons()[0].disabled).toBe(false);
    expect(downloadButtons()[1].disabled).toBe(false);
  });

  it('downloads the original image', async () => {
    fixture.componentRef.setInput('status', 'ready');
    fixture.detectChanges();

    downloadButtons()[0].click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(downloadMock).toHaveBeenCalledTimes(1);

    expect(downloadMock.mock.calls[0][0]).toBe(ORIGINAL_URL);

    expect(downloadMock.mock.calls[0][1]).toBe(`cloudinary-${DEMO_IMAGE_ASSETS[0].id}-original`);
  });

  it('downloads the optimized image', async () => {
    fixture.componentRef.setInput('status', 'ready');
    fixture.detectChanges();

    downloadButtons()[1].click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(downloadMock).toHaveBeenCalledTimes(1);

    expect(downloadMock.mock.calls[0][0]).toBe(OPTIMIZED_URL);

    expect(downloadMock.mock.calls[0][1]).toBe(`cloudinary-${DEMO_IMAGE_ASSETS[0].id}-optimized`);
  });

  it('prevents downloads when images are not ready', () => {
    fixture.componentRef.setInput('status', 'loading');
    fixture.detectChanges();

    downloadButtons()[0].click();
    downloadButtons()[1].click();

    expect(downloadMock).not.toHaveBeenCalled();
  });

  it('restores download controls after a failed download', async () => {
    downloadMock.mockRejectedValueOnce(new Error('Network failure'));

    fixture.componentRef.setInput('status', 'ready');
    fixture.detectChanges();

    downloadButtons()[0].click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(downloadMock).toHaveBeenCalledTimes(1);

    expect(downloadButtons()[0].disabled).toBe(false);
    expect(downloadButtons()[1].disabled).toBe(false);
  });

  it('displays the error state when loading fails', () => {
    fixture.componentRef.setInput('status', 'error');
    fixture.detectChanges();

    expect(root.querySelector('[role="alert"]')).not.toBeNull();

    expect(root.querySelector('.cil-stage')).toBeNull();
  });

  it('emits retry when the retry button is clicked', () => {
    fixture.componentRef.setInput('status', 'error');

    const retrySpy = vi.fn();

    fixture.componentInstance.retry.subscribe(retrySpy);

    fixture.detectChanges();

    query<HTMLButtonElement>('button').click();

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });
});
