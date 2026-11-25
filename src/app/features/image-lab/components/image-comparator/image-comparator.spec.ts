import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DEMO_IMAGE_ASSETS } from '../../../../core/constants/demo-images.constant';
import { ImageComparatorComponent } from './image-comparator';

describe('ImageComparatorComponent', () => {
  it('moves slider with keyboard arrows and respects 0-100 bounds', () => {
    TestBed.configureTestingModule({
      imports: [ImageComparatorComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(ImageComparatorComponent);
    fixture.componentRef.setInput('asset', DEMO_IMAGE_ASSETS[0]);
    fixture.componentRef.setInput('originalUrl', 'https://res.cloudinary.com/demo/image/upload/sample');
    fixture.componentRef.setInput(
      'optimizedUrl',
      'https://res.cloudinary.com/demo/image/upload/q_auto/f_auto/sample'
    );
    fixture.detectChanges();

    const slider = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuenow')).toBe('50');

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(slider.getAttribute('aria-valuenow')).toBe('55');

    slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('emits retry when in error state and retry button is clicked', () => {
    TestBed.configureTestingModule({
      imports: [ImageComparatorComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(ImageComparatorComponent);
    fixture.componentRef.setInput('asset', DEMO_IMAGE_ASSETS[0]);
    fixture.componentRef.setInput('originalUrl', 'https://res.cloudinary.com/demo/image/upload/sample');
    fixture.componentRef.setInput('optimizedUrl', 'https://res.cloudinary.com/demo/image/upload/sample');
    fixture.componentRef.setInput('status', 'error');
    const retrySpy = vi.fn();
    fixture.componentInstance.retry.subscribe(retrySpy);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });
});
