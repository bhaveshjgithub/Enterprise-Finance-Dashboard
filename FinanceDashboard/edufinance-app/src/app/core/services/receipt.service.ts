import { Injectable, signal } from '@angular/core';
import { ReceiptData } from '../models/finance.models';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  receiptData = signal<ReceiptData | null>(null);

  open(data: ReceiptData) {
    this.receiptData.set(data);
  }

  close() {
    this.receiptData.set(null);
  }
}
