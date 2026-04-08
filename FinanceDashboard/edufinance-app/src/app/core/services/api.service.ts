import { Injectable, inject, signal, computed } from '@angular/core';
import { ToastService } from './toast.service';
import { StateService } from './state.service';
import { Transaction } from '../models/finance.models';
import { getLocalIsoDate } from './utils/number-to-words.util';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/v1/transactions';
  
  toast = inject(ToastService);
  state = inject(StateService);

  allTransactions = signal<Transaction[]>([]);
  institutionMultiplier = signal<number>(1);
  txFilter = signal<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  activeBranch = signal<string>('ALL');

  filteredTransactions = computed(() => {
    const filter = this.txFilter();
    return this.allTransactions().filter(tx => filter === 'ALL' ? true : tx.type === filter);
  });

  totals = computed(() => {
    let inc = 0, exp = 0;
    this.allTransactions().forEach(tx => {
      if (tx.type === 'INCOME') inc += tx.amount;
      else exp += tx.amount;
    });
    return { income: inc, expense: exp, net: inc - exp };
  });

  // NEW: Mocked Financial Year Totals (Will be connected to backend later)
  yearlyTotals = computed(() => {
    const mult = this.institutionMultiplier();
    const baseInc = 14500000; // 1.45 Cr base
    const baseExp = 3200000;  // 32 L base
    return { 
      income: baseInc * mult, 
      expense: baseExp * mult, 
      net: (baseInc - baseExp) * mult 
    };
  });

  async initializeApp() {
    try {
      const branch = this.activeBranch();
      const res = await fetch(`${this.API_BASE_URL}/dashboard?branch=${branch}`);
      if (res.ok) {
        this.state.isDemoMode.set(false);
        this.loadDashboardData();
      } else {
        this.enableDemoMode();
      }
    } catch (e) {
      this.enableDemoMode();
    }
  }

  enableDemoMode() {
    if (!this.state.isDemoMode()) {
      this.state.isDemoMode.set(true);
      this.toast.show("Connected to Local Demo Mode. No data will be saved permanently.", "info");
    }
    this.loadMockDashboard();
  }

  async loadDashboardData() {
    if (this.state.isDemoMode()) {
      this.loadMockDashboard();
      return;
    }
    try {
      const branch = this.activeBranch();
      const res = await fetch(`${this.API_BASE_URL}/dashboard?branch=${branch}`);
      
      if (res.ok) {
        const data = await res.json();
        this.allTransactions.set(data.recentTransactions || []);
      } else {
        throw new Error();
      }
    } catch {
      this.enableDemoMode();
    }
  }

  async searchTransactions(startDate?: string, endDate?: string, name?: string) {
    if (this.state.isDemoMode()) {
      this.toast.show("Search simulated in Demo Mode.", "info");
      return;
    }
    try {
      const branch = this.activeBranch();
      let url = `${this.API_BASE_URL}/search?branch=${branch}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (name) url += `&name=${encodeURIComponent(name)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.allTransactions.set(data || []);
      }
    } catch (e) {
      this.toast.show("Search failed.", "error");
    }
  }

  async getUserSuggestions(query: string): Promise<string[]> {
    if (this.state.isDemoMode()) {
      return ['Arjun Kumar', 'Bhavesh Jivrakh', 'Hamara Pump'].filter(n => n.toLowerCase().includes(query.toLowerCase()));
    }
    try {
      const res = await fetch(`${this.API_BASE_URL}/suggestions/users?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  }

  loadMockDashboard() {
    const mult = this.institutionMultiplier();
    const todayDate = getLocalIsoDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = getLocalIsoDate(yesterday);
    const isAll = this.activeBranch() === 'ALL';
    
    this.allTransactions.set([
      { transactionDate: todayDate, referenceName: 'Arjun Kumar', description: 'Semester Tuition Fee', transactionReference: 'DEMO-RCPT-001', branch: isAll ? 'ENGINEERING' : this.activeBranch(), department: 'Admin Office', type: 'INCOME', amount: 45000 * mult },
      { transactionDate: todayDate, referenceName: 'IT Admin', description: 'Printer Cartridges', transactionReference: 'DEMO-EXP-001', branch: isAll ? 'PHARMACY' : this.activeBranch(), department: 'IT Dept', type: 'EXPENSE', amount: 2100 * mult },
      { transactionDate: todayDate, referenceName: 'Bhavesh Jivrakh', description: 'Bonafide Certificate', transactionReference: 'DEMO-RCPT-7617', branch: isAll ? 'PRIMARY' : this.activeBranch(), department: 'Library', type: 'INCOME', amount: 500 },
      { transactionDate: yesterdayDate, referenceName: 'HOD Engg', description: 'Lab Equipment', transactionReference: 'DEMO-EXP-4456', branch: isAll ? 'ENGINEERING' : this.activeBranch(), department: 'Engineering', type: 'EXPENSE', amount: 3200 * mult },
      { transactionDate: yesterdayDate, referenceName: 'Hamara Pump', description: 'Bus Fuel', transactionReference: 'DEMO-EXP-8008', branch: isAll ? 'PRE_PRIMARY' : this.activeBranch(), department: 'Transport', type: 'EXPENSE', amount: 3000 }
    ]);
  }

  async saveIncome(payload: any, file: File | null): Promise<any> {
    if (this.state.isDemoMode()) {
      const ref = 'DEMO-RCPT-' + Math.floor(Math.random() * 10000);
      this.toast.show("Demo Mode: Receipt generated", "info");
      return { transactionReference: ref, branch: payload.branch };
    }
    
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) formData.append('file', file);

    const res = await fetch(`${this.API_BASE_URL}/income`, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  async saveExpense(payload: any): Promise<any> {
    if (this.state.isDemoMode()) {
      const ref = 'DEMO-EXP-' + Math.floor(Math.random() * 10000);
      this.toast.show("Demo Mode: Expense logged", "info");
      return { transactionReference: ref, branch: payload.branch };
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    const res = await fetch(`${this.API_BASE_URL}/expense`, {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  async updateTransaction(reference: string, payload: any): Promise<any> {
    if (this.state.isDemoMode()) {
      this.toast.show("Demo Mode: Transaction updated successfully.", "success");
      this.loadMockDashboard();
      return;
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    const res = await fetch(`${this.API_BASE_URL}/${reference}`, {
      method: 'PUT',
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  async emailSummary(): Promise<void> {
    if (this.state.isDemoMode()) {
      await new Promise(resolve => setTimeout(() => {
        this.toast.show("Demo Mode: Summary emailed.", "success");
        resolve(true);
      }, 1500));
      return;
    }
    const res = await fetch(`${this.API_BASE_URL}/email-summary`, { method: 'POST' });
    if (!res.ok) throw new Error();
    this.toast.show("Today's financial summary has been successfully emailed.", "success");
  }
}
