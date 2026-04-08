import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-dues-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto animate-fade-in">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-red-50/50">
          <div>
            <h3 class="text-lg font-semibold text-slate-800"><i class="fa-solid fa-triangle-exclamation text-red-500 mr-2"></i> Pending Fee Collection</h3>
            <p class="text-sm text-slate-500 mt-1">Identify defaulters and dispatch automated payment reminders to recover revenue.</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-slate-500">Total Outstanding</p>
            <p class="text-2xl font-bold text-red-600">₹4,15,000</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th class="px-6 py-4 font-medium">Student ID</th>
                <th class="px-6 py-4 font-medium">Name & Course</th>
                <th class="px-6 py-4 font-medium">Fee Category</th>
                <th class="px-6 py-4 font-medium">Due Date</th>
                <th class="px-6 py-4 font-medium">Pending Amount</th>
                <th class="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-slate-100">
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900">CS-2024-112</td>
                <td class="px-6 py-4 text-slate-700"><div>Arjun Kumar</div><div class="text-xs text-slate-400">B.Tech CS (Year 2)</div></td>
                <td class="px-6 py-4 text-slate-500">Semester Tuition</td>
                <td class="px-6 py-4 text-red-500 font-medium">15 Jan 2026</td>
                <td class="px-6 py-4 font-semibold text-slate-800">₹45,000</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="remind()" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded text-xs font-semibold transition-colors border border-blue-200">
                    <i class="fa-solid fa-paper-plane mr-1"></i> Remind
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }`]
})

export class DuesTableComponent {
  toast = inject(ToastService);
  remind() { this.toast.show('Reminder SMS & Email sent to Arjun Kumar.', 'success'); }
}