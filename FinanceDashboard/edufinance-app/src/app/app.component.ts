import { Component, OnInit, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './core/services/state.service';
import { ApiService } from './core/services/api.service';
import { ToastService } from './core/services/toast.service';

import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { IncomeFormComponent } from './features/income/income-form/income-form.component';
import { ExpenseFormComponent } from './features/expense/expense-form/expense-form.component';
import { DuesTableComponent } from './features/dues/dues-table/dues-table.component';
import { BudgetProgressComponent } from './features/budgets/budget-progress/budget-progress.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ReceiptModalComponent } from './shared/components/receipt-modal/receipt-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent, 
    IncomeFormComponent, 
    ExpenseFormComponent, 
    DuesTableComponent, 
    BudgetProgressComponent, 
    ToastContainerComponent, 
    ReceiptModalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-brand-50 text-slate-800 font-sans flex h-screen w-full overflow-hidden absolute inset-0">
      
      <!-- Global Sidebar Navigation -->
      <aside class="w-64 bg-brand-900 text-white flex flex-col transition-all duration-300">
        <div class="h-16 flex items-center px-6 border-b border-slate-700 shrink-0">
          <i class="fa-solid fa-building-columns text-xl mr-3 text-blue-400"></i>
          <span class="text-lg font-bold tracking-wide">EduFinance</span>
        </div>
        
        <nav class="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Daily Operations</p>
          
          @if (state.isAdmin()) {
            <a href="javascript:void(0)" (click)="state.activeTab.set('dashboard')" class="nav-link flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors" [class.bg-slate-800]="state.activeTab() === 'dashboard'" [class.text-white]="state.activeTab() === 'dashboard'" [class.text-slate-300]="state.activeTab() !== 'dashboard'" [class.hover:bg-slate-800]="state.activeTab() !== 'dashboard'">
              <i class="fa-solid fa-chart-pie w-6"></i> Dashboard
            </a>
          }
          
          <a href="javascript:void(0)" (click)="state.activeTab.set('income')" class="nav-link flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors" [class.bg-slate-800]="state.activeTab() === 'income'" [class.text-white]="state.activeTab() === 'income'" [class.text-slate-300]="state.activeTab() !== 'income'" [class.hover:bg-slate-800]="state.activeTab() !== 'income'">
            <i class="fa-solid fa-file-invoice-dollar w-6"></i> Income & Receipts
          </a>
          
          <a href="javascript:void(0)" (click)="state.activeTab.set('expense')" class="nav-link flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors" [class.bg-slate-800]="state.activeTab() === 'expense'" [class.text-white]="state.activeTab() === 'expense'" [class.text-slate-300]="state.activeTab() !== 'expense'" [class.hover:bg-slate-800]="state.activeTab() !== 'expense'">
            <i class="fa-solid fa-wallet w-6"></i> Petty Cash
          </a>

          @if (state.isAdmin()) {
            <div class="border-t border-slate-700 my-4 mx-2"></div>
            <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Management Tools</p>
            
            <a href="javascript:void(0)" (click)="state.activeTab.set('dues')" class="nav-link flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors" [class.bg-slate-800]="state.activeTab() === 'dues'" [class.text-white]="state.activeTab() === 'dues'" [class.text-red-400]="state.activeTab() !== 'dues'" [class.hover:bg-slate-800]="state.activeTab() !== 'dues'">
              <i class="fa-solid fa-hand-holding-dollar w-6"></i> Pending Dues <span class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">Pro</span>
            </a>
            
            <a href="javascript:void(0)" (click)="state.activeTab.set('budgets')" class="nav-link flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors" [class.bg-slate-800]="state.activeTab() === 'budgets'" [class.text-white]="state.activeTab() === 'budgets'" [class.text-emerald-400]="state.activeTab() !== 'budgets'" [class.hover:bg-slate-800]="state.activeTab() !== 'budgets'">
              <i class="fa-solid fa-chart-line w-6"></i> Dept Budgets <span class="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">Pro</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-slate-700 mt-auto bg-brand-900 shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white transition-colors" [class.bg-blue-500]="state.isAdmin()" [class.bg-purple-500]="!state.isAdmin()">
                {{ state.isAdmin() ? 'A' : 'C' }}
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-white transition-all">{{ state.isAdmin() ? 'Admin' : 'Data Clerk' }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">{{ state.isAdmin() ? 'Administrator' : 'Standard User' }}</p>
              </div>
            </div>
            <button (click)="state.toggleRole()" class="text-slate-400 hover:text-white transition-colors" title="Switch Role (Demo)">
              <i class="fa-solid fa-users-gear text-lg"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <div>
            <h2 class="text-xl font-semibold text-slate-800">{{ pageTitle() }}</h2>
          </div>
          <div class="flex items-center text-sm font-medium text-slate-500">
            <span class="mr-4 px-3 py-1 rounded-full text-xs font-bold flex items-center cursor-pointer transition-colors"
                  (click)="showApiToast()"
                  [class.bg-green-100]="!state.isDemoMode()" [class.text-green-700]="!state.isDemoMode()"
                  [class.bg-red-100]="state.isDemoMode()" [class.text-red-700]="state.isDemoMode()">
              @if(state.isDemoMode()) {
                <i class="fa-solid fa-link-slash mr-1"></i> API Offline (Demo)
              } @else {
                <i class="fa-solid fa-link mr-1"></i> API Connected
              }
            </span>
            <i class="fa-regular fa-calendar mr-2"></i>
            <span>{{ today | date:'fullDate' }}</span>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
          @if (state.isLoading()) {
            <div class="absolute inset-0 bg-slate-50/80 backdrop-blur-[2px] z-20 flex flex-col items-center pt-32">
              <i class="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-3"></i>
              <p class="text-slate-700 font-medium shadow-sm bg-white px-4 py-2 rounded-full border border-slate-200">Loading Institution Data...</p>
            </div>
          }

          @switch (state.activeTab()) {
            @case ('dashboard') { <app-dashboard /> }
            @case ('income') { <app-income-form /> }
            @case ('expense') { <app-expense-form /> }
            @case ('dues') { <app-dues-table /> }
            @case ('budgets') { <app-budget-progress /> }
          }
        </div>
      </main>
      
      <app-toast-container />
      <app-receipt-modal />
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
    aside ::-webkit-scrollbar-thumb { background-color: #334155; }
    aside ::-webkit-scrollbar-thumb:hover { background-color: #475569; }
    .bg-brand-900 { background-color: #0f172a; }
    .bg-brand-50 { background-color: #f8fafc; }
    
    @media print {
      body * { visibility: hidden; }
      app-receipt-modal, app-receipt-modal * { visibility: visible; }
      app-receipt-modal { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 0; }
      .no-print { display: none !important; }
      #printable-receipt { border: 2px solid #0f172a; padding: 2rem; border-radius: 0; box-shadow: none; width: 100%; max-width: 100%; }
    }
  `]
})
export class AppComponent implements OnInit {
  state = inject(StateService);
  api = inject(ApiService);
  toast = inject(ToastService);
  today = new Date();

  pageTitle = computed(() => {
    const titles: Record<string, string> = {
      'dashboard': 'Admin Dashboard',
      'income': 'Income & Receipts',
      'expense': 'Petty Cash Management',
      'dues': 'Pending Fee Collection',
      'budgets': 'Department Budgets Overview'
    };
    return titles[this.state.activeTab()] || 'Dashboard';
  });

  ngOnInit() {
    this.api.initializeApp();
    
    // Fallback logic for tailwind removed. Rely on index.html setup.
  }

  showApiToast() {
    this.toast.show(
      this.state.isDemoMode() ? "If disconnected, app runs in Demo Mode." : "Connected safely to backend API.",
      "info"
    );
  }
}
