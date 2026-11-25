import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAlertTriangle, LucideMoveHorizontal, LucideRefreshCw } from '@lucide/angular';
import { LanguageService } from '../../../../core/services/language.service';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { DemoImageAsset } from '../../models/image.model';
import type { LabLoadStatus, OptimizationResult } from '../../models/optimization-result.model';

const KEYBOARD_STEP = 5;
const KEYBOARD_LARGE_STEP = 15;

@Component({
  selector: 'cil-image-comparator',
  standalone: true,
  imports: [
    LucideMoveHorizontal,
    LucideAlertTriangle,
    LucideRefreshCw,
    TranslatePipe,
    SkeletonComponent,
    ButtonComponent,
  ],
  templateUrl: './image-comparator.html',
  styleUrl: './image-comparator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComparatorComponent {
  private readonly languageService = inject(LanguageService);

  readonly asset = input.required<DemoImageAsset>();
  readonly originalUrl = input.required<string>();
  readonly optimizedUrl = input.required<string>();
  readonly result = input<OptimizationResult | null>(null);
  readonly status = input<LabLoadStatus>('idle');
  readonly errorKey = input<string | null>(null);
  readonly retry = output<void>();

  private readonly stageRef = viewChild<ElementRef<HTMLDivElement>>('stage');

  protected readonly position = signal<number>(50);
  protected readonly isDragging = signal<boolean>(false);

  protected readonly originalSrc = computed(
    () => this.result()?.original.objectUrl ?? this.originalUrl()
  );

  protected readonly optimizedSrc = computed(
    () => this.result()?.optimized.objectUrl ?? this.optimizedUrl()
  );

  protected readonly altText = computed(() => {
    const lang = this.languageService.language();
    return this.asset().alt[lang];
  });

  protected readonly clipPath = computed(() => `inset(0 ${100 - this.position()}% 0 0)`);

  protected onPointerDown(event: PointerEvent): void {
    this.isDragging.set(true);
    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture?.(event.pointerId);
    this.updatePositionFromClientX(event.clientX);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    this.updatePositionFromClientX(event.clientX);
  }

  protected onPointerUp(): void {
    this.isDragging.set(false);
  }

  protected onSliderKeyDown(event: KeyboardEvent): void {
    const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.position.update((p) => Math.max(0, p - step));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.position.update((p) => Math.min(100, p + step));
        break;
      case 'Home':
        event.preventDefault();
        this.position.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.position.set(100);
        break;
      default:
        break;
    }
  }

  private updatePositionFromClientX(clientX: number): void {
    const stage = this.stageRef()?.nativeElement;
    if (!stage) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    this.position.set(Math.min(100, Math.max(0, Math.round(ratio * 10) / 10)));
  }
}
