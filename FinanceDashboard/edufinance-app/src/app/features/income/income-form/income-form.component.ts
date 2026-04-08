import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { getLocalIsoDate } from '../../../core/services/utils/number-to-words.util';
@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in pb-12">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-8 py-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold text-slate-800">Generate Cash Receipt</h3>
            <p class="text-sm text-slate-500 mt-1">Log incoming payments. This will save directly to Database via API.</p>
          </div>
          @if (lastGeneratedRef()) {
            <div>
              <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                <i class="fa-solid fa-check mr-2"></i> Generated ID: {{ lastGeneratedRef() }}
              </span>
            </div>
          }
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
              <label class="block text-sm font-medium text-slate-700 mb-2">Student / Reference Name <span class="text-red-500">*</span></label>
              <input formControlName="studentName" type="text" (input)="onNameInput($event)" autocomplete="off" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('studentName')?.invalid && form.get('studentName')?.touched">
              
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
              <label class="block text-sm font-medium text-slate-700 mb-2">Department Requesting <span class="text-red-500">*</span></label>
              <select formControlName="department" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option>Admin Office</option>
                <option>Examinations</option>
                <option>Library</option>
                <option>Hostel</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-2">Purpose of Payment <span class="text-red-500">*</span></label>
              <input formControlName="purpose" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('purpose')?.invalid && form.get('purpose')?.touched">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Amount (₹) <span class="text-red-500">*</span></label>
              <input formControlName="amount" type="number" step="0.01" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" [class.border-red-500]="form.get('amount')?.invalid && form.get('amount')?.touched">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Date <span class="text-red-500">*</span></label>
              <input formControlName="date" type="date" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>

            <!-- Upload Document Section -->
            <div class="md:col-span-2 pt-2 border-t border-slate-100">
              <label class="block text-sm font-medium text-slate-700 mb-2">Upload Supporting Document (Optional)</label>
              <div class="flex items-center gap-4">
                <input type="file" (change)="onFileSelected($event)"
                       class="w-full text-sm text-slate-500
                              file:mr-4 file:py-2.5 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100 cursor-pointer
                              border border-slate-300 rounded-lg pr-4 bg-white transition-all">
              </div>
              <p class="text-xs text-slate-500 mt-2"><i class="fa-solid fa-circle-info mr-1"></i> Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
            </div>
            
          </div>
          
          <div class="pt-4 mt-2 flex justify-end">
            <button type="submit" [disabled]="form.invalid || isSaving()" class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70 flex items-center">
              @if(isSaving()) { <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Saving... }
              @else { Generate Receipt & Save }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }`]
})
export class IncomeFormComponent implements OnInit {
  fb = inject(FormBuilder);
  api = inject(ApiService);
  toast = inject(ToastService);
  receipt = inject(ReceiptService);

  isSaving = signal(false);
  lastGeneratedRef = signal<string | null>(null);
  selectedFile: File | null = null;

  // Autocomplete Signals
  suggestions = signal<string[]>([]);
  showSuggestions = signal(false);
  searchTimeout: any;

  form = this.fb.group({
    branch: ['', Validators.required],
    studentName: ['', Validators.required],
    department: ['Admin Office', Validators.required],
    purpose: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    date: ['', Validators.required]
  });

  ngOnInit() {
    this.form.patchValue({ date: getLocalIsoDate(new Date()) });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
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
    this.form.patchValue({ studentName: name });
    this.showSuggestions.set(false);
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    
    this.isSaving.set(true);
    try {
      const payload = this.form.value;
      // Pass the selected file to the API service
      const res = await this.api.saveIncome(payload, this.selectedFile);
      
      this.lastGeneratedRef.set(res.transactionReference);
      if(!this.api.state.isDemoMode()) this.toast.show(`Success! Recorded as ${res.transactionReference}`);
      
      this.receipt.open({
        ref: res.transactionReference,
        date: payload.date!,
        name: payload.studentName!,
        branch: payload.branch!,
        dept: payload.department!,
        purpose: payload.purpose!,
        amount: payload.amount!
      });

      this.form.reset({ branch: '', department: 'Admin Office', date: getLocalIsoDate(new Date()) });
      this.selectedFile = null;
      this.api.loadDashboardData();
    } catch {
      this.toast.show("Network Error: Failed to save income", "error");
    } finally {
      this.isSaving.set(false);
    }
  }
}

