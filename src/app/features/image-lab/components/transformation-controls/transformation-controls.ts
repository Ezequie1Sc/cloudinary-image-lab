import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LucideCopy, LucideExternalLink, LucideRotateCcw } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { copyTextToClipboard } from '../../../../shared/utils/clipboard.utils';
import type {
  MaxWidthOption,
  OutputFormat,
  QualityMode,
  TransformationConfig,
} from '../../models/transformation.model';
import { DimensionSelectorComponent } from '../dimension-selector/dimension-selector';
import { FormatSelectorComponent } from '../format-selector/format-selector';
import { QualitySelectorComponent } from '../quality-selector/quality-selector';

@Component({
  selector: 'cil-transformation-controls',
  standalone: true,
  imports: [
    LucideRotateCcw,
    LucideCopy,
    LucideExternalLink,
    TranslatePipe,
    ButtonComponent,
    FormatSelectorComponent,
    QualitySelectorComponent,
    DimensionSelectorComponent,
  ],
  templateUrl: './transformation-controls.html',
  styleUrl: './transformation-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformationControlsComponent {
  private readonly toast = inject(ToastService);
  private readonly language = inject(LanguageService);

  readonly config = input.required<TransformationConfig>();
  readonly optimizedUrl = input.required<string>();
  readonly cloudName = input.required<string>();

  readonly formatChange = output<OutputFormat>();
  readonly qualityModeChange = output<QualityMode>();
  readonly manualQualityChange = output<number>();
  readonly maxWidthChange = output<MaxWidthOption>();
  readonly resetRequested = output<void>();

  protected async copyUrl(): Promise<void> {
    const ok = await copyTextToClipboard(this.optimizedUrl());
    this.toast.show(
      this.language.translate(ok ? 'notifications.urlCopied' : 'notifications.copyFailed'),
      ok ? 'success' : 'error'
    );
  }

  protected onReset(): void {
    this.resetRequested.emit();
    this.toast.show(this.language.translate('notifications.settingsReset'), 'default');
  }
}
