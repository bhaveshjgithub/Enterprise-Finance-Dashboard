import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StateService {
  role = signal<'ADMIN' | 'USER'>('ADMIN');
  activeTab = signal<string>('dashboard');
  isDemoMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  isAdmin = computed(() => this.role() === 'ADMIN');
  
  toggleRole() {
    this.role.update(r => r === 'ADMIN' ? 'USER' : 'ADMIN');
    if (!this.isAdmin() && ['dashboard', 'dues', 'budgets'].includes(this.activeTab())) {
      this.activeTab.set('income');
    }
  }
}
