import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { getLocalIsoDate } from '../../../core/services/utils/number-to-words.util';
@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in pb-12">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-200 bg-slate-50">
          <h3 class="text-lg font-semibold text-slate-800">Log Daily Expense</h3>
          <p class="text-sm text-slate-500 mt-1">Record ad-hoc expenditures. Will be sent via API to backend.</p>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="submit()" class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Branch / Institution <span class="text-red-500">*</span></label>
              <select formControlName="branch" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('branch')?.invalid && form.get('branch')?.touched">
                <option value="" disabled selected>Select Branch</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="ENGINEERING">Engineering</option>
                <option value="PRE_PRIMARY">Pre-Primary School</option>
                <option value="PRIMARY">Primary School</option>
                <option value="HIGHER_ED">Higher Education</option>
              </select>
            </div>

            <!-- Autocomplete Field -->
            <div class="relative">
              <label class="block text-sm font-medium text-slate-700 mb-2">Requested By (Reference Name) <span class="text-red-500">*</span></label>
              <input formControlName="requestedBy" type="text" (input)="onNameInput($event)" autocomplete="off" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('requestedBy')?.invalid && form.get('requestedBy')?.touched">
              
              @if (showSuggestions() && suggestions().length > 0) {
                <ul class="absolute z-50 w-full bg-white border border-slate-200 shadow-xl rounded-lg mt-1 max-h-40 overflow-y-auto left-0 py-1">
                  @for (sug of suggestions(); track sug) {
                    <li (click)="selectSuggestion(sug)" class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0 font-medium">
                      <i class="fa-solid fa-user text-slate-400 mr-2"></i> {{ sug }}
                    </li>
                  }
                </ul>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Category <span class="text-red-500">*</span></label>
              <select formControlName="category" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option>Travel / Transport</option>
                <option>Office Supplies</option>
                <option>Refreshments & Snacks</option>
                <option>Maintenance & Repairs</option>
                <option>Miscellaneous</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">Description <span class="text-red-500">*</span></label>
              <input formControlName="description" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('description')?.invalid && form.get('description')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Amount (₹) <span class="text-red-500">*</span></label>
              <input formControlName="amount" type="number" step="0.01" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('amount')?.invalid && form.get('amount')?.touched">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Date <span class="text-red-500">*</span></label>
              <input formControlName="date" type="date" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
          </div>
          <div class="pt-4 mt-2 flex justify-end">
            <button type="submit" [disabled]="form.invalid || isSaving()" class="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 focus:ring-4 focus:ring-slate-300 transition-all flex items-center disabled:opacity-70">
              @if(isSaving()) { <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Saving... }
              @else { Log Expense & Save }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }`]
})
export class ExpenseFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  toast = inject(ToastService);

  isSaving = signal(false);
  
  // Autocomplete Signals
  suggestions = signal<string[]>([]);
  showSuggestions = signal(false);
  searchTimeout: any;

  form = this.fb.group({
    branch: ['', Validators.required],
    requestedBy: ['', Validators.required],
    category: ['Office Supplies', Validators.required],
    description: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    date: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue({ date: getLocalIsoDate(new Date()) });
  }

  onNameInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimeout);
    
    if (val.length > 0) {
      this.searchTimeout = setTimeout(async () => {
        const sugs = await this.api.getUserSuggestions(val);
        this.suggestions.set(sugs);
        this.showSuggestions.set(true);
      }, 300); 
    } else {
      this.showSuggestions.set(false);
    }
  }

  selectSuggestion(name: string) {
    this.form.patchValue({ requestedBy: name });
    this.showSuggestions.set(false);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    
    this.isSaving.set(true);
    try {
      // NOTE: File upload removed as per requirements
      const res = await this.api.saveExpense(this.form.value);
      if(!this.api.state.isDemoMode()) this.toast.show(`Expense saved! Ref: ${res.transactionReference}`);
      this.form.reset({ branch: '', category: 'Office Supplies', date: getLocalIsoDate(new Date()) });
      this.api.loadDashboardData();
    } catch {
      this.toast.show("Network Error: Failed to save expense", "error");
    } finally {
      this.isSaving.set(false);
    }
  }
}
