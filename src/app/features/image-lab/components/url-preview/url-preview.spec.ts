import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UrlPreviewComponent } from './url-preview';

describe('UrlPreviewComponent', () => {
  it('highlights Cloudinary transformation segments in the URL', () => {
    TestBed.configureTestingModule({
      imports: [UrlPreviewComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(UrlPreviewComponent);
    fixture.componentRef.setInput(
      'url',
      'https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/sample'
    );
    fixture.detectChanges();

    const tokens = fixture.nativeElement.querySelectorAll('.cil-url-token');
    expect(tokens.length).toBe(3);
  });
});
