import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideCheck, LucideCopy, LucideExternalLink } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { copyTextToClipboard } from '../../../../shared/utils/clipboard.utils';

interface UrlSegment {
  readonly text: string;
  readonly isTransform: boolean;
}

@Component({
  selector: 'cil-url-preview',
  standalone: true,
  imports: [LucideCopy, LucideCheck, LucideExternalLink, TranslatePipe, ButtonComponent],
  templateUrl: './url-preview.html',
  styleUrl: './url-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlPreviewComponent {
  private readonly toast = inject(ToastService);
  private readonly language = inject(LanguageService);

  readonly url = input.required<string>();
  protected readonly copied = signal<boolean>(false);

  protected readonly segments = computed<readonly UrlSegment[]>(() => {
    const raw = this.url();
    const marker = '/image/upload/';
    const idx = raw.indexOf(marker);
    if (idx === -1) {
      return [{ text: raw, isTransform: false }];
    }

    const prefix = raw.slice(0, idx + marker.length);
    const remainder = raw.slice(idx + marker.length);
    const parts = remainder.split('/');

    const result: UrlSegment[] = [{ text: prefix, isTransform: false }];
    parts.forEach((part, index) => {
      const isTransform = /^(c_|w_|h_|q_|f_)/.test(part);
      result.push({ text: part, isTransform });
      if (index < parts.length - 1) {
        result.push({ text: '/', isTransform: false });
      }
    });

    return result;
  });

  protected async copy(): Promise<void> {
    const ok = await copyTextToClipboard(this.url());
    if (ok) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    }
    this.toast.show(
      this.language.translate(ok ? 'notifications.urlCopied' : 'notifications.copyFailed'),
      ok ? 'success' : 'error'
    );
  }
}
