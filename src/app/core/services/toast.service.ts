import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
  readonly variant: ToastVariant;
}

const DEFAULT_TOAST_DURATION_MS = 2800;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<readonly ToastMessage[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(text: string, variant: ToastVariant = 'default', durationMs = DEFAULT_TOAST_DURATION_MS): void {
    const id = this.nextId++;
    this._toasts.update((current) => [...current, { id, text, variant }]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
