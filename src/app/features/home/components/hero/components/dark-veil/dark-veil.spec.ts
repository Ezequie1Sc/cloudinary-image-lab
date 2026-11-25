import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DarkVeilComponent } from './dark-veil';

describe('DarkVeilComponent', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,

        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),

        addListener: vi.fn(),
        removeListener: vi.fn(),

        dispatchEvent: vi.fn(),
      }))
    );

    await TestBed.configureTestingModule({
      imports: [DarkVeilComponent],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates the dark veil component', () => {
    const fixture = TestBed.createComponent(DarkVeilComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a decorative canvas', () => {
    const fixture = TestBed.createComponent(DarkVeilComponent);

    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;

    expect(canvas).toBeTruthy();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports reduced motion without initializing WebGL', async () => {
    const fixture = TestBed.createComponent(DarkVeilComponent);

    fixture.detectChanges();

    await fixture.whenStable();

    expect(HTMLCanvasElement.prototype.getContext).not.toHaveBeenCalled();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
