import { DecimalPipe } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';

import {
  LucideImage,
  LucideSlidersHorizontal,
  LucideCloud,
  LucideMonitor,
  LucidePlay,
  LucidePause,
  LucideRotateCcw,
} from '@lucide/angular';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type PipelineStageId = 'source' | 'transformation' | 'cdn' | 'device';

interface PipelineStage {
  readonly id: PipelineStageId;
  readonly number: string;
  readonly technicalLabel: string;
}

@Component({
  selector: 'cil-delivery-pipeline',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslatePipe,
    LucideImage,
    LucideSlidersHorizontal,
    LucideCloud,
    LucideMonitor,
    LucidePlay,
    LucidePause,
    LucideRotateCcw,
  ],
  templateUrl: './delivery-pipeline.html',
  styleUrl: './delivery-pipeline.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryPipelineComponent {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stages: readonly PipelineStage[] = [
    {
      id: 'source',
      number: '01',
      technicalLabel: 'Original asset',
    },
    {
      id: 'transformation',
      number: '02',
      technicalLabel: 'f_auto / q_auto',
    },
    {
      id: 'cdn',
      number: '03',
      technicalLabel: 'CDN / Cache',
    },
    {
      id: 'device',
      number: '04',
      technicalLabel: 'HTTP / HTTPS',
    },
  ];

  protected readonly activeIndex = signal(0);

  protected readonly isPlaying = signal(false);

  protected readonly reducedMotion = signal(false);

  protected readonly activeStage = computed(() => this.stages[this.activeIndex()]);

  protected readonly progress = computed(
    () => ((this.activeIndex() + 1) / this.stages.length) * 100
  );

  constructor() {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      this.reducedMotion.set(mediaQuery.matches);

      this.isPlaying.set(!mediaQuery.matches);

      const onMotionChange = (event: MediaQueryListEvent): void => {
        this.reducedMotion.set(event.matches);

        if (event.matches) {
          this.isPlaying.set(false);
        }
      };

      mediaQuery.addEventListener('change', onMotionChange);

      this.destroyRef.onDestroy(() => {
        mediaQuery.removeEventListener('change', onMotionChange);
      });
    }

    effect((onCleanup) => {
      if (!this.isPlaying() || this.reducedMotion()) {
        return;
      }

      const interval = setInterval(() => {
        this.activeIndex.update((index) => (index + 1) % this.stages.length);
      }, 3200);

      onCleanup(() => {
        clearInterval(interval);
      });
    });
  }

  protected selectStage(index: number): void {
    if (index < 0 || index >= this.stages.length) {
      return;
    }

    this.isPlaying.set(false);
    this.activeIndex.set(index);
  }

  protected togglePlayback(): void {
    if (this.reducedMotion()) {
      return;
    }

    this.isPlaying.update((playing) => !playing);
  }

  protected resetPipeline(): void {
    this.isPlaying.set(false);
    this.activeIndex.set(0);
  }
}
