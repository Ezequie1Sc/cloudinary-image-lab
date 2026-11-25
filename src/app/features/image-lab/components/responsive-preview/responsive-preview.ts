import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideMonitor, LucideSmartphone, LucideTablet } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { DemoImageAsset } from '../../models/image.model';
import type { ResponsiveCandidate } from '../../services/cloudinary.service';

export type ViewportPreset = 'mobile' | 'tablet' | 'desktop';

interface ViewportMeta {
  readonly id: ViewportPreset;
  readonly containerWidthPx: number;
  readonly candidateWidth: number;
}

const VIEWPORT_PRESETS: Record<ViewportPreset, ViewportMeta> = {
  mobile: { id: 'mobile', containerWidthPx: 360, candidateWidth: 640 },
  tablet: { id: 'tablet', containerWidthPx: 680, candidateWidth: 800 },
  desktop: { id: 'desktop', containerWidthPx: 960, candidateWidth: 1280 },
};

@Component({
  selector: 'cil-responsive-preview',
  standalone: true,
  imports: [LucideSmartphone, LucideTablet, LucideMonitor, TranslatePipe],
  templateUrl: './responsive-preview.html',
  styleUrl: './responsive-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponsivePreviewComponent {
  private readonly languageService = inject(LanguageService);

  readonly asset = input.required<DemoImageAsset>();
  readonly candidates = input.required<readonly ResponsiveCandidate[]>();
  readonly srcSet = input.required<string>();

  protected readonly viewport = signal<ViewportPreset>('desktop');
  protected readonly sizesAttribute = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 960px';

  protected readonly activeViewportMeta = computed(() => VIEWPORT_PRESETS[this.viewport()]);

  protected readonly activeCandidate = computed(() => {
    const target = this.activeViewportMeta().candidateWidth;
    const list = this.candidates();
    return list.find((c) => c.width === target) ?? list[list.length - 1];
  });

  protected readonly altText = computed(() => this.asset().alt[this.languageService.language()]);

  protected setViewport(preset: ViewportPreset): void {
    this.viewport.set(preset);
  }
}
