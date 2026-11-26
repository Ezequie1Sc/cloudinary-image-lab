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

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { copyTextToClipboard } from '../../../../shared/utils/clipboard.utils';

import {
  SyntaxHighlighterService,
  type SyntaxLanguage,
} from '../../../image-lab/components/code-playground/services/syntax-highlighter.service';

@Component({
  selector: 'cil-doc-code-block',
  standalone: true,
  imports: [LucideCheck, LucideCopy, TranslatePipe],
  templateUrl: './doc-code-block.html',
  styleUrl: './doc-code-block.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocCodeBlockComponent {
  private readonly highlighter = inject(SyntaxHighlighterService);

  private readonly toast = inject(ToastService);

  private readonly languageService = inject(LanguageService);

  private readonly destroyRef = inject(DestroyRef);

  private copyTimeout: ReturnType<typeof setTimeout> | undefined;

  private destroyed = false;

  readonly code = input.required<string>();

  readonly language = input<SyntaxLanguage>('typescript');

  readonly fileName = input('example.ts');

  protected readonly copied = signal(false);

  protected readonly highlightedLines = signal<ThemedToken[][]>([]);

  protected readonly lineCount = computed(() => this.code().split(/\r?\n/).length);

  protected readonly languageLabel = computed(() => {
    switch (this.language()) {
      case 'html':
        return 'HTML';

      case 'text':
        return 'Plain Text';

      default:
        return 'TypeScript';
    }
  });

  protected readonly fileExtension = computed(() => {
    switch (this.language()) {
      case 'html':
        return 'HTML';

      case 'text':
        return 'TXT';

      default:
        return 'TS';
    }
  });

  constructor() {
    effect((onCleanup) => {
      const code = this.code();

      const language = this.language();

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
      this.destroyed = true;

      if (this.copyTimeout !== undefined) {
        clearTimeout(this.copyTimeout);
      }
    });
  }

  protected async copyCode(): Promise<void> {
    const ok = await copyTextToClipboard(this.code());

    if (this.destroyed) {
      return;
    }

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
      this.languageService.translate(ok ? 'notifications.codeCopied' : 'notifications.copyFailed'),
      ok ? 'success' : 'error'
    );
  }
}
