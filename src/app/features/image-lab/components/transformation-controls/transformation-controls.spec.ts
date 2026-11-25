import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_TRANSFORMATION_CONFIG } from '../../models/transformation.model';
import { TransformationControlsComponent } from './transformation-controls';

describe('TransformationControlsComponent', () => {
  it('emits resetRequested when reset button is triggered', () => {
    TestBed.configureTestingModule({
      imports: [TransformationControlsComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(TransformationControlsComponent);
    fixture.componentRef.setInput('config', DEFAULT_TRANSFORMATION_CONFIG);
    fixture.componentRef.setInput('optimizedUrl', 'https://res.cloudinary.com/demo/image/upload/q_auto/f_auto/sample');
    fixture.componentRef.setInput('cloudName', 'demo');
    const resetSpy = vi.fn();
    fixture.componentInstance.resetRequested.subscribe(resetSpy);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const resetButton = buttons[buttons.length - 1];
    resetButton.click();

    expect(resetSpy).toHaveBeenCalledTimes(1);
  });
});
