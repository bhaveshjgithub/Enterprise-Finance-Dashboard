import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/finance.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = ++this.idCounter;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
