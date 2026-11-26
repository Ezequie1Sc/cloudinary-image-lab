import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { LucideCheck, LucideCopy } from '@lucide/angular';

import type { ThemedToken } from 'shiki';

import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';

import { ButtonComponent } from '../../../../shared/components/button/button';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import { copyTextToClipboard } from '../../../../shared/utils/clipboard.utils';

import type { TransformationConfig } from '../../models/transformation.model';

import {
  SyntaxHighlighterService,
  type SyntaxLanguage,
} from './services/syntax-highlighter.service';

export type CodeTab = 'url' | 'html' | 'angular' | 'typescript';

@Component({
  selector: 'cil-code-playground',
  standalone: true,

  imports: [LucideCopy, LucideCheck, TranslatePipe, ButtonComponent],

  templateUrl: './code-playground.html',
  styleUrl: './code-playground.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePlaygroundComponent {
  private readonly toast = inject(ToastService);

  private readonly language = inject(LanguageService);

  private readonly highlighter = inject(SyntaxHighlighterService);

  private readonly destroyRef = inject(DestroyRef);

  private copyTimeout: ReturnType<typeof setTimeout> | undefined;

  readonly cloudName = input.required<string>();

  readonly publicId = input.required<string>();

  readonly config = input.required<TransformationConfig>();

  readonly optimizedUrl = input.required<string>();

  readonly srcSet = input.required<string>();

  protected readonly tabs: readonly CodeTab[] = ['url', 'html', 'angular', 'typescript'];

  protected readonly activeTab = signal<CodeTab>('angular');

  protected readonly copied = signal(false);

  protected readonly highlightedLines = signal<ThemedToken[][]>([]);

  protected readonly fileName = computed(() => {
    switch (this.activeTab()) {
      case 'url':
        return 'delivery-url.txt';

      case 'html':
        return 'optimized-image.html';

      case 'typescript':
        return 'cloudinary.ts';

      default:
        return 'optimized-image.component.ts';
    }
  });

  protected readonly languageLabel = computed(() => {
    switch (this.activeTab()) {
      case 'url':
        return 'Plain Text';

      case 'html':
        return 'HTML';

      default:
        return 'TypeScript';
    }
  });

  protected readonly lineCount = computed(() => this.snippet().split(/\r?\n/).length);

  protected readonly snippet = computed(() => {
    const tab = this.activeTab();

    const cfg = this.config();

    const cloud = this.cloudName();

    const publicId = this.publicId();

    const url = this.optimizedUrl();

    if (tab === 'url') {
      return url;
    }

    if (tab === 'html') {
      const widthAttr = cfg.maxWidth ?? 1280;

      const heightAttr = Math.round((widthAttr * 2) / 3);

      return `<img
  src="${url}"
  srcset="${this.srcSet()}"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, ${widthAttr}px"
  width="${widthAttr}"
  height="${heightAttr}"
  loading="lazy"
  decoding="async"
  alt="Optimized Cloudinary asset"
/>`;
    }

    const resizeImport = cfg.maxWidth
      ? `import { limitFit } from '@cloudinary/url-gen/actions/resize';
`
      : '';

    const resizeChain = cfg.maxWidth
      ? `
      .resize(limitFit().width(${cfg.maxWidth}))`
      : '';

    const qualityExpr = this.resolveQualityExpression(cfg);

    const formatExpr = this.resolveFormatExpression(cfg);

    if (tab === 'typescript') {
      return `import { Cloudinary } from '@cloudinary/url-gen';
${resizeImport}import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { ${formatExpr.importName} } from '@cloudinary/url-gen/qualifiers/format';
${qualityExpr.importLine}
const cld = new Cloudinary({
  cloud: { cloudName: '${cloud}' },
});

const optimizedImage = cld
  .image('${publicId}')${resizeChain}
  .delivery(quality(${qualityExpr.call}))
  .delivery(format(${formatExpr.call}));

export const deliveryUrl = optimizedImage.toURL();`;
    }

    return `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CloudinaryModule } from '@cloudinary/ng';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
${resizeImport}import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { ${formatExpr.importName} } from '@cloudinary/url-gen/qualifiers/format';
${qualityExpr.importLine}
@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CloudinaryModule],
  template: '<advanced-image [cldImg]="img" alt="Optimized Cloudinary asset" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizedImageComponent {
  readonly img: CloudinaryImage;

  constructor() {
    const cld = new Cloudinary({ cloud: { cloudName: '${cloud}' } });
    this.img = cld
      .image('${publicId}')${resizeChain}
      .delivery(quality(${qualityExpr.call}))
      .delivery(format(${formatExpr.call}));
  }
}`;
  });

  constructor() {
    effect((onCleanup) => {
      const code = this.snippet();

      const tab = this.activeTab();

      const language = this.resolveLanguage(tab);

      let cancelled = false;

      this.highlightedLines.set(this.highlighter.createPlainTokens(code));

      void this.highlighter.highlight(code, language).then((tokens) => {
        if (!cancelled) {
          this.highlightedLines.set(tokens);
        }
      });

      onCleanup(() => {
        cancelled = true;
      });
    });

    this.destroyRef.onDestroy(() => {
      if (this.copyTimeout !== undefined) {
        clearTimeout(this.copyTimeout);
      }
    });
  }

  protected selectTab(tab: CodeTab): void {
    this.activeTab.set(tab);

    this.copied.set(false);
  }

  protected async copySnippet(): Promise<void> {
    const ok = await copyTextToClipboard(this.snippet());

    if (ok) {
      this.copied.set(true);

      if (this.copyTimeout !== undefined) {
        clearTimeout(this.copyTimeout);
      }

      this.copyTimeout = setTimeout(() => {
        this.copied.set(false);

        this.copyTimeout = undefined;
      }, 1800);
    }

    this.toast.show(
      this.language.translate(ok ? 'notifications.codeCopied' : 'notifications.copyFailed'),
      ok ? 'success' : 'error'
    );
  }

  private resolveLanguage(tab: CodeTab): SyntaxLanguage {
    switch (tab) {
      case 'url':
        return 'text';

      case 'html':
        return 'html';

      default:
        return 'typescript';
    }
  }

  private resolveFormatExpression(cfg: TransformationConfig): {
    importName: string;
    call: string;
  } {
    switch (cfg.format) {
      case 'webp':
        return {
          importName: 'webp',
          call: 'webp()',
        };

      case 'avif':
        return {
          importName: 'avif',
          call: 'avif()',
        };

      case 'jpg':
        return {
          importName: 'jpeg',
          call: 'jpeg()',
        };

      case 'png':
        return {
          importName: 'png',
          call: 'png()',
        };

      default:
        return {
          importName: 'auto as autoFormat',
          call: 'autoFormat()',
        };
    }
  }

  private resolveQualityExpression(cfg: TransformationConfig): {
    importLine: string;
    call: string;
  } {
    switch (cfg.qualityMode) {
      case 'auto:best':
        return {
          importLine: `import { autoBest } from '@cloudinary/url-gen/qualifiers/quality';
`,
          call: 'autoBest()',
        };

      case 'auto:good':
        return {
          importLine: `import { autoGood } from '@cloudinary/url-gen/qualifiers/quality';
`,
          call: 'autoGood()',
        };

      case 'auto:eco':
        return {
          importLine: `import { autoEco } from '@cloudinary/url-gen/qualifiers/quality';
`,
          call: 'autoEco()',
        };

      case 'auto:low':
        return {
          importLine: `import { autoLow } from '@cloudinary/url-gen/qualifiers/quality';
`,
          call: 'autoLow()',
        };

      case 'manual':
        return {
          importLine: '',
          call: `${cfg.manualQuality}`,
        };

      default:
        return {
          importLine: `import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
`,
          call: 'autoQuality()',
        };
    }
  }
}
