import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptService } from '../../../core/services/receipt.service';


@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (receiptService.receiptData(); as data) {
      <div class="fixed inset-0 bg-slate-900/60 z-[55] flex items-center justify-center backdrop-blur-sm p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto print:max-h-none">
          
          <div class="p-4 border-b border-slate-200 flex justify-end gap-3 no-print bg-slate-50 rounded-t-xl sticky top-0 z-10">
            <button (click)="print()" class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-print"></i> Print Receipt
            </button>
            <button (click)="close()" class="px-5 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors">
              Close
            </button>
          </div>
          
          <div class="p-8 bg-white" id="printable-area">
            <div id="printable-receipt" class="border-[3px] border-slate-800 p-8 rounded relative mx-auto bg-white" style="background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 20px 20px; background-position: center;">
              
              <div class="text-center mb-8 border-b-2 border-slate-800 pb-6 relative z-10 bg-white/90">
                <h1 class="text-3xl font-bold text-slate-900 uppercase tracking-wider mb-2">EduFinance University</h1>
                <p class="text-sm text-slate-600 font-medium">123 Education Boulevard, Knowledge City, State 400001</p>
                <p class="text-sm text-slate-600">Email: accounts&#64;edufinance.edu | Phone: +91 1800-123-4567</p>
                <div class="mt-4 inline-block px-4 py-1 border-2 border-slate-800 font-bold text-lg tracking-widest uppercase bg-slate-100">
                  Official Fee Receipt
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-y-6 gap-x-12 mb-8 relative z-10 bg-white/90 p-4 rounded">
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Receipt Number</p>
                  <p class="font-bold text-slate-800 text-lg">{{ data.ref }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</p>
                  <p class="font-bold text-slate-800 text-lg">{{ data.date }}</p>
                </div>
                
                <div class="col-span-2">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Received With Thanks From</p>
                  <p class="font-bold text-slate-900 text-xl border-b border-dashed border-slate-400 pb-1">{{ data.name }}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Branch / Institution</p>
                  <p class="font-medium text-slate-800 text-lg">{{ data.branch }}</p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</p>
                  <p class="font-medium text-slate-800 text-lg">{{ data.dept }}</p>
                </div>

                <div class="col-span-2">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment Purpose</p>
                  <p class="font-medium text-slate-800 text-lg">{{ data.purpose }}</p>
                </div>

                <div class="col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-lg mt-2">
                  <div class="flex justify-between items-center mb-2">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount Received</p>
                    <p class="text-2xl font-bold text-slate-900">₹{{ data.amount | number:'1.2-2' }}</p>
                  </div>
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount in Words</p>
                  <p class="font-medium text-slate-800 italic">Rupees {{ getWords(data.amount) }}</p>
                </div>
              </div>

              <div class="mt-16 flex justify-between items-end relative z-10 bg-white/90 px-4">
                <div class="text-center">
                  <div class="w-40 border-b border-slate-800 mb-2"></div>
                  <p class="text-sm font-semibold text-slate-600">Student / Payer Signature</p>
                </div>
                <div class="text-center">
                  <div class="w-40 border-b border-slate-800 mb-2 relative">
                    <div class="absolute -top-12 left-8 border-2 border-red-500/50 rounded-full w-24 h-24 flex items-center justify-center text-red-500/50 -rotate-12 pointer-events-none">
                      <span class="font-bold text-xs uppercase text-center leading-tight">Paid &<br>Verified<br>EduFinance</span>
                    </div>
                  </div>
                  <p class="text-sm font-semibold text-slate-600">Authorized Signatory</p>
                </div>
              </div>
              
              <div class="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                This is a system generated receipt and does not require a physical signature if paid online.
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ReceiptModalComponent {
  receiptService = inject(ReceiptService);
  
  close() { this.receiptService.close(); }
  print() { window.print(); }
  getWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: any): string => {
      if ((n = n.toString()).length > 9) return 'overflow';
      const n_match = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_match) return '';
      let str = '';
      str += Number(n_match[1]) !== 0 ? (a[Number(n_match[1])] || b[Number(n_match[1][0])] + ' ' + a[Number(n_match[1][1])]) + 'Crore ' : '';
      str += Number(n_match[2]) !== 0 ? (a[Number(n_match[2])] || b[Number(n_match[2][0])] + ' ' + a[Number(n_match[2][1])]) + 'Lakh ' : '';
      str += Number(n_match[3]) !== 0 ? (a[Number(n_match[3])] || b[Number(n_match[3][0])] + ' ' + a[Number(n_match[3][1])]) + 'Thousand ' : '';
      str += Number(n_match[4]) !== 0 ? (a[Number(n_match[4])] || b[Number(n_match[4][0])] + ' ' + a[Number(n_match[4][1])]) + 'Hundred ' : '';
      str += Number(n_match[5]) !== 0 ? ((str !== '' ? 'and ' : '') + (a[Number(n_match[5])] || b[Number(n_match[5][0])] + ' ' + a[Number(n_match[5][1])])) : '';
      return str.trim() + ' Only';
    };

    const amount = Math.floor(num);
    const decimals = Math.round((num - amount) * 100);
    let res = inWords(amount);
    if (decimals > 0) res += ' and ' + inWords(decimals).replace(' Only', '') + ' Paise Only';
    return res;
  }
}
