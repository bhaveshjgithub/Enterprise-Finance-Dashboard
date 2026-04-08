import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center transition-all duration-300 animate-slide-up"
             [class.bg-green-600]="toast.type === 'success'"
             [class.bg-red-600]="toast.type === 'error'"
             [class.bg-blue-600]="toast.type === 'info'">
          <i class="fa-solid mr-3"
             [class.fa-circle-check]="toast.type === 'success'"
             [class.fa-triangle-exclamation]="toast.type === 'error'"
             [class.fa-circle-info]="toast.type === 'info'"></i>
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
