export interface Transaction {
  transactionDate: string;
  referenceName: string;
  description: string;
  transactionReference: string;
  department: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  branch: string;
}

export interface ReceiptData {
  ref: string;
  date: string;
  name: string;
  dept: string;
  purpose: string;
  amount: number;
  branch: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}