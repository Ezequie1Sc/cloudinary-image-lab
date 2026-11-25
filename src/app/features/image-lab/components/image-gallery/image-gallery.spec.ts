import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DEMO_IMAGE_ASSETS } from '../../../../core/constants/demo-images.constant';
import { provideCloudinaryConfig } from '../../../../core/providers/cloudinary.provider';
import { ImageGalleryComponent } from './image-gallery';

describe('ImageGalleryComponent', () => {
  it('emits imageSelect when a thumbnail is clicked', () => {
    TestBed.configureTestingModule({
      imports: [ImageGalleryComponent],
      providers: [provideHttpClient(), provideCloudinaryConfig()],
    });

    const fixture = TestBed.createComponent(ImageGalleryComponent);
    fixture.componentRef.setInput('assets', DEMO_IMAGE_ASSETS);
    fixture.componentRef.setInput('selectedImageId', DEMO_IMAGE_ASSETS[0].id);
    fixture.componentRef.setInput('activeCategory', 'all');
    const selectSpy = vi.fn();
    fixture.componentInstance.imageSelect.subscribe(selectSpy);
    fixture.detectChanges();

    const thumbs = fixture.nativeElement.querySelectorAll('.cil-thumb-item') as NodeListOf<HTMLButtonElement>;
    thumbs[1].click();
    expect(selectSpy).toHaveBeenCalledWith(DEMO_IMAGE_ASSETS[1]);
  });
});
