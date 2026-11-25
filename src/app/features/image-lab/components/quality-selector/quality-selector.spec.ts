import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { QualitySelectorComponent } from './quality-selector';

describe('QualitySelectorComponent', () => {
  it('renders manual range slider only when manual mode is active', () => {
    TestBed.configureTestingModule({
      imports: [QualitySelectorComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(QualitySelectorComponent);
    fixture.componentRef.setInput('mode', 'auto');
    fixture.componentRef.setInput('manualQuality', 80);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[type="range"]')).toBeNull();

    fixture.componentRef.setInput('mode', 'manual');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="range"]')).not.toBeNull();
  });
});
