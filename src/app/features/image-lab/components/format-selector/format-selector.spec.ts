import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { FormatSelectorComponent } from './format-selector';

describe('FormatSelectorComponent', () => {
  it('emits selected output format', () => {
    TestBed.configureTestingModule({
      imports: [FormatSelectorComponent],
      providers: [provideHttpClient()],
    });

    const fixture = TestBed.createComponent(FormatSelectorComponent);
    fixture.componentRef.setInput('value', 'auto');
    const spy = vi.fn();
    fixture.componentInstance.valueChange.subscribe(spy);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith('webp');
  });
});
