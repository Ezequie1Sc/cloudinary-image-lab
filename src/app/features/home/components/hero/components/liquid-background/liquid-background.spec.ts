import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiquidBackgroundComponent } from './liquid-background';

describe('LiquidBackgroundComponent', () => {
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
      imports: [LiquidBackgroundComponent],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('creates the liquid background component', () => {
    const fixture = TestBed.createComponent(LiquidBackgroundComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a decorative canvas', () => {
    const fixture = TestBed.createComponent(LiquidBackgroundComponent);

    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;

    expect(canvas).toBeTruthy();

    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports environments without WebGL', async () => {
    const fixture = TestBed.createComponent(LiquidBackgroundComponent);

    fixture.detectChanges();

    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
