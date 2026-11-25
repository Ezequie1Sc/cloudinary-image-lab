import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCheck, LucideAlertCircle, LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'cil-toast-container',
  standalone: true,
  imports: [LucideCheck, LucideAlertCircle, LucideX, TranslatePipe],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
