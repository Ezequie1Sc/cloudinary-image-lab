import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GradientBackgroundComponent } from './gradient-background';

describe('GradientBackgroundComponent', () => {
  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
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
      imports: [GradientBackgroundComponent],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates the gradient background component', () => {
    const fixture = TestBed.createComponent(GradientBackgroundComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an accessible decorative canvas', () => {
    const fixture = TestBed.createComponent(GradientBackgroundComponent);

    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;

    expect(canvas).toBeTruthy();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports environments without Canvas rendering', async () => {
    const fixture = TestBed.createComponent(GradientBackgroundComponent);

    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
