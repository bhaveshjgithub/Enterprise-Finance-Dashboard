import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { ToastService } from '../../../core/services/toast.service';
import { getLocalIsoDate } from '../../../core/services/utils/number-to-words.util';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-[1400px] mx-auto animate-fade-in relative">
      
      <!-- Branch Filter -->
      <div class="flex flex-wrap gap-3 mb-6">
        @for (inst of institutions; track inst.code) {
          <button (click)="setInstitution(inst.code, inst.mult)" 
                  class="px-5 py-2.5 rounded font-semibold text-sm shadow-md transition-all border-2"
                  [class.bg-blue-600]="activeInst() === inst.code"
                  [class.text-white]="activeInst() === inst.code"
                  [class.border-transparent]="activeInst() === inst.code"
                  [class.bg-white]="activeInst() !== inst.code"
                  [class.text-slate-700]="activeInst() !== inst.code"
                  [class.border-slate-300]="activeInst() !== inst.code"
                  [class.hover:border-blue-400]="activeInst() !== inst.code"
                  [class.hover:text-blue-600]="activeInst() !== inst.code">
            {{ inst.name }}
          </button>
        }
      </div>

      <!-- Advanced Filter Bar -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div class="flex flex-col lg:flex-row gap-4 items-end">
          
          <div class="flex-1 w-full relative">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Search User / Ref</label>
            <div class="relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400"></i>
              <input type="text" [formControl]="searchName" (input)="onSearchInput($event)" placeholder="Type name to search..." class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all">
              
              <!-- Autocomplete Dropdown -->
              @if (showSearchSuggestions() && searchSuggestions().length > 0) {
                <ul class="absolute z-50 w-full bg-white border border-slate-200 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto top-full left-0 py-1">
                  @for (sug of searchSuggestions(); track sug) {
                    <li (click)="selectSearchSuggestion(sug)" class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0 font-medium">
                      <i class="fa-solid fa-user-circle text-slate-400 mr-2"></i> {{ sug }}
                    </li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="w-full lg:w-48">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quick Select</label>
            <select [formControl]="quickDate" (change)="applyQuickDate()" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all bg-white">
              <option value="">Custom Range</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
            </select>
          </div>

          <div class="w-full lg:w-40">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input type="date" [formControl]="startDate" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all">
          </div>

          <div class="w-full lg:w-40">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input type="date" [formControl]="endDate" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all">
          </div>

          <div class="flex gap-2 w-full lg:w-auto">
            <button (click)="applyFilters()" class="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold text-sm hover:bg-slate-900 transition-colors shadow-sm w-full lg:w-auto whitespace-nowrap">
              <i class="fa-solid fa-filter mr-1"></i> Apply Filter
            </button>
            <button (click)="clearFilters()" class="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors shadow-sm">
              Clear
            </button>
          </div>

        </div>
      </div>

      <!-- Selected Period Overview (Dynamic based on Filters) -->
      <div class="flex justify-between items-center mb-4 mt-2">
        <h3 class="text-lg font-semibold text-slate-800">Selected Period Overview</h3>
        @if (state.isAdmin()) {
          <button (click)="sendSummary()" [disabled]="isSendingMail()" class="px-5 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 transition-colors shadow flex items-center disabled:opacity-70">
            @if(isSendingMail()) {
              <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Sending...
            } @else {
              <i class="fa-solid fa-envelope mr-2"></i> Email Report
            }
          </button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="absolute -right-6 -top-6 text-green-50 opacity-50"><i class="fa-solid fa-chart-line text-9xl"></i></div>
          <div class="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-5 relative z-10">
            <i class="fa-solid fa-arrow-trend-up text-2xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-sm font-semibold text-slate-500 mb-1 tracking-wide uppercase">Period Income</p>
            <h3 class="text-3xl font-bold text-slate-800 tracking-tight">₹{{ displayIncome() | number:'1.2-2' }}</h3>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="absolute -right-6 -top-6 text-red-50 opacity-50"><i class="fa-solid fa-arrow-trend-down text-9xl"></i></div>
          <div class="w-14 h-14 rounded-lg bg-red-100 flex items-center justify-center text-red-600 mr-5 relative z-10">
            <i class="fa-solid fa-arrow-trend-down text-2xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-sm font-semibold text-slate-500 mb-1 tracking-wide uppercase">Period Expenses</p>
            <h3 class="text-3xl font-bold text-slate-800 tracking-tight">₹{{ displayExpense() | number:'1.2-2' }}</h3>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="absolute -right-6 -top-6 text-blue-50 opacity-50"><i class="fa-solid fa-scale-balanced text-9xl"></i></div>
          <div class="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-5 relative z-10">
            <i class="fa-solid fa-scale-balanced text-2xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-sm font-semibold text-slate-500 mb-1 tracking-wide uppercase">Period Net Balance</p>
            <h3 class="text-3xl font-bold text-slate-800 tracking-tight">₹{{ displayNet() | number:'1.2-2' }}</h3>
          </div>
        </div>
      </div>

      <!-- Financial Year Overview (Fixed YTD Totals) -->
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Financial Year 2025-2026 Overview (YTD)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 mr-4 relative z-10">
            <i class="fa-solid fa-vault text-xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">FY Total Income</p>
            <h3 class="text-2xl font-bold text-slate-800 tracking-tight">₹{{ api.yearlyTotals().income | number:'1.2-2' }}</h3>
          </div>
        </div>
        <div class="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 mr-4 relative z-10">
            <i class="fa-solid fa-file-invoice text-xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">FY Total Expenses</p>
            <h3 class="text-2xl font-bold text-slate-800 tracking-tight">₹{{ api.yearlyTotals().expense | number:'1.2-2' }}</h3>
          </div>
        </div>
        <div class="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 flex items-center relative overflow-hidden">
          <div class="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 mr-4 relative z-10">
            <i class="fa-solid fa-building-columns text-xl"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">FY Net Balance</p>
            <h3 class="text-2xl font-bold text-slate-800 tracking-tight">₹{{ api.yearlyTotals().net | number:'1.2-2' }}</h3>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 bg-white">
          <div class="flex justify-between items-center gap-4">
            <h3 class="font-bold text-slate-800 text-lg">Transaction Records</h3>
            
            <div class="inline-flex bg-slate-100 p-1 rounded-md border border-slate-200">
              <button (click)="api.txFilter.set('ALL')" class="px-4 py-1.5 text-xs rounded transition-all" [class.font-bold]="api.txFilter() === 'ALL'" [class.shadow-sm]="api.txFilter() === 'ALL'" [class.bg-white]="api.txFilter() === 'ALL'" [class.text-slate-800]="api.txFilter() === 'ALL'" [class.text-slate-500]="api.txFilter() !== 'ALL'">All</button>
              <button (click)="api.txFilter.set('INCOME')" class="px-4 py-1.5 text-xs rounded transition-all" [class.font-bold]="api.txFilter() === 'INCOME'" [class.shadow-sm]="api.txFilter() === 'INCOME'" [class.bg-white]="api.txFilter() === 'INCOME'" [class.text-slate-800]="api.txFilter() === 'INCOME'" [class.text-slate-500]="api.txFilter() !== 'INCOME'">Income</button>
              <button (click)="api.txFilter.set('EXPENSE')" class="px-4 py-1.5 text-xs rounded transition-all" [class.font-bold]="api.txFilter() === 'EXPENSE'" [class.shadow-sm]="api.txFilter() === 'EXPENSE'" [class.bg-white]="api.txFilter() === 'EXPENSE'" [class.text-slate-800]="api.txFilter() === 'EXPENSE'" [class.text-slate-500]="api.txFilter() !== 'EXPENSE'">Expense</button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">User / Reference Name</th>
                <th class="px-6 py-4">Description & Ref</th>
                <th class="px-6 py-4">Branch</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4 text-right">Amount</th>
                <th class="px-6 py-4 text-center border-l-2 border-slate-800 text-slate-800">Action</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-slate-100">
              @if (api.filteredTransactions().length === 0) {
                <tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">No transactions match your search filters.</td></tr>
              }
              @for (tx of api.filteredTransactions(); track tx.transactionReference) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4 text-slate-500 font-medium">{{ tx.transactionDate }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <i class="fa-solid fa-user text-xs"></i>
                      </div>
                      <span class="font-bold text-slate-700">{{ tx.referenceName }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-800 font-bold">{{ tx.description }} <br><span class="text-xs text-slate-400 font-normal">{{ tx.transactionReference }}</span></td>
                  <td class="px-6 py-4 text-slate-500 font-medium">{{ tx.branch === 'MIXED_BRANCHES' ? 'VARIOUS' : tx.branch }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider"
                          [class.bg-green-100]="tx.type === 'INCOME'" [class.text-green-800]="tx.type === 'INCOME'"
                          [class.bg-red-100]="tx.type === 'EXPENSE'" [class.text-red-800]="tx.type === 'EXPENSE'">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-bold text-base"
                      [class.text-green-600]="tx.type === 'INCOME'" [class.text-red-600]="tx.type === 'EXPENSE'">
                    {{ tx.type === 'INCOME' ? '+' : '-' }} ₹{{ tx.amount | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 text-center border-l-2 border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors">
                    @if (tx.transactionDate === todayDate && state.isAdmin()) {
                      <button (click)="openEditModal(tx)" class="text-xs font-bold text-blue-600 hover:text-white border border-blue-600 hover:bg-blue-600 px-3 py-1.5 rounded transition-all shadow-sm">
                        <i class="fa-solid fa-pen mr-1"></i> Edit
                      </button>
                    } @else {
                      <span class="text-xs font-medium text-slate-400 cursor-not-allowed" title="Only Admin can edit today's records">
                        <i class="fa-solid fa-lock mr-1"></i> Locked
                      </span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Smooth Edit Modal -->
      @if (editingTx()) {
        <div class="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 class="font-bold text-slate-800 text-lg">Edit Transaction: {{ editingTx()?.transactionReference }}</h3>
              <button (click)="closeEditModal()" class="text-slate-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form [formGroup]="editForm" (ngSubmit)="submitEdit()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select formControlName="branch" class="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="PRE_PRIMARY">Pre-Primary School</option>
                    <option value="PRIMARY">Primary School</option>
                    <option value="HIGHER_ED">Higher Education</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Reference Name</label>
                  <input formControlName="referenceName" type="text" class="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <input formControlName="department" type="text" class="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
                  <input formControlName="amount" type="number" class="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Description / Purpose</label>
                  <input formControlName="description" type="text" class="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500">
                </div>
              </div>
              <div class="flex justify-end pt-4 gap-3">
                <button type="button" (click)="closeEditModal()" class="px-5 py-2 bg-slate-200 text-slate-800 rounded font-medium hover:bg-slate-300 transition-colors text-sm">Cancel</button>
                <button type="submit" [disabled]="editForm.invalid || isUpdating()" class="px-5 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors text-sm disabled:opacity-70 flex items-center">
                  @if(isUpdating()) { <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Updating... }
                  @else { <i class="fa-solid fa-check mr-2"></i> Save Changes }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.2s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`]
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  state = inject(StateService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  todayDate = '';
  isSendingMail = signal(false);
  activeInst = signal('ALL');

  // Filter Controls
  startDate = this.fb.control('');
  endDate = this.fb.control('');
  quickDate = this.fb.control('');
  searchName = this.fb.control('');
  
  // Autocomplete state for dashboard search
  searchSuggestions = signal<string[]>([]);
  showSearchSuggestions = signal(false);
  searchTimeout: any;

  // Edit Modal State
  editingTx = signal<any | null>(null);
  isUpdating = signal(false);
  editForm = this.fb.group({
    branch: ['', Validators.required],
    referenceName: ['', Validators.required],
    department: ['', Validators.required],
    description: ['', Validators.required],
    category: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]]
  });

  institutions = [
    { code: 'ALL', name: 'All Dashboard', mult: 1 },
    { code: 'PHARMACY', name: 'Pharmacy', mult: 2.5 },
    { code: 'ENGINEERING', name: 'Engineering', mult: 5.2 },
    { code: 'PRE_PRIMARY', name: 'Pre-Primary School', mult: 0.5 },
    { code: 'PRIMARY', name: 'Primary School', mult: 0.8 },
    { code: 'HIGHER_ED', name: 'Higher Education', mult: 3.5 }
  ];

  displayIncome = computed(() => this.state.isDemoMode() ? 47200 * this.api.institutionMultiplier() : this.api.totals().income);
  displayExpense = computed(() => this.state.isDemoMode() ? 8450 * this.api.institutionMultiplier() : this.api.totals().expense);
  displayNet = computed(() => this.displayIncome() - this.displayExpense());

  ngOnInit() {
    this.todayDate = getLocalIsoDate(new Date());
    this.applyQuickDate('TODAY'); // Default to today
  }

  setInstitution(code: string, mult: number) {
    this.activeInst.set(code);
    this.state.isLoading.set(true);
    setTimeout(() => {
      this.api.institutionMultiplier.set(mult);
      this.api.activeBranch.set(code);
      this.applyFilters(); // Re-apply current filters with new branch
      this.state.isLoading.set(false);
    }, 400);
  }

  // --- FILTER LOGIC ---
  applyQuickDate(forceValue?: string) {
    const val = forceValue || this.quickDate.value;
    const today = new Date();
    
    if (val === 'TODAY') {
      const t = getLocalIsoDate(today);
      this.startDate.setValue(t);
      this.endDate.setValue(t);
    } else if (val === 'LAST_7_DAYS') {
      this.endDate.setValue(getLocalIsoDate(today));
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      this.startDate.setValue(getLocalIsoDate(lastWeek));
    } else if (val === 'LAST_30_DAYS') {
      this.endDate.setValue(getLocalIsoDate(today));
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      this.startDate.setValue(getLocalIsoDate(lastMonth));
    }
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimeout);
    
    if (val.length > 0) {
      this.searchTimeout = setTimeout(async () => {
        const sugs = await this.api.getUserSuggestions(val);
        this.searchSuggestions.set(sugs);
        this.showSearchSuggestions.set(true);
      }, 300); // 300ms debounce
    } else {
      this.showSearchSuggestions.set(false);
    }
  }

  selectSearchSuggestion(name: string) {
    this.searchName.setValue(name);
    this.showSearchSuggestions.set(false);
  }

  applyFilters() {
    this.api.searchTransactions(
      this.startDate.value || undefined,
      this.endDate.value || undefined,
      this.searchName.value || undefined
    );
    this.showSearchSuggestions.set(false);
  }

  clearFilters() {
    this.startDate.setValue('');
    this.endDate.setValue('');
    this.quickDate.setValue('');
    this.searchName.setValue('');
    this.api.loadDashboardData(); // Reset to default
  }

  // --- EDIT LOGIC ---
  openEditModal(tx: any) {
    this.editingTx.set(tx);
    this.editForm.patchValue({
      branch: tx.branch === 'MIXED_BRANCHES' ? '' : tx.branch,
      referenceName: tx.referenceName,
      department: tx.department,
      description: tx.description,
      category: tx.category || '',
      amount: tx.amount
    });
  }

  closeEditModal() {
    this.editingTx.set(null);
    this.editForm.reset();
  }

  async submitEdit() {
    if (this.editForm.invalid) return;
    this.isUpdating.set(true);
    try {
      await this.api.updateTransaction(this.editingTx()!.transactionReference, this.editForm.value);
      this.toast.show("Transaction updated successfully.", "success");
      this.closeEditModal();
      this.applyFilters(); // Refresh data
    } catch {
      this.toast.show("Failed to update transaction.", "error");
    } finally {
      this.isUpdating.set(false);
    }
  }

  async sendSummary() {
    this.isSendingMail.set(true);
    // try { await this.api.emailSummary(); }
    // catch { this.toast.show("Backend Error: Failed to dispatch email.", "error"); }
    // finally { this.isSendingMail.set(false); }
  }
}
