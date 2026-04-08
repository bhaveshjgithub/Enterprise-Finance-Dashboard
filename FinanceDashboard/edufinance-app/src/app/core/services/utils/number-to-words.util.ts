export function numberToWords(num: number): string {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  if (num.toString().length > 9) return 'Amount too large';
  
  const padded = ('000000000' + Math.floor(num)).slice(-9);
  const match = padded.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  
  if (!match) return ''; 
  
  let str = '';
  str += (match[1] !== '00') ? (a[Number(match[1])] || b[Number(match[1][0])] + ' ' + a[Number(match[1][1])]) + 'Crore ' : '';
  str += (match[2] !== '00') ? (a[Number(match[2])] || b[Number(match[2][0])] + ' ' + a[Number(match[2][1])]) + 'Lakh ' : '';
  str += (match[3] !== '00') ? (a[Number(match[3])] || b[Number(match[3][0])] + ' ' + a[Number(match[3][1])]) + 'Thousand ' : '';
  str += (match[4] !== '0') ? (a[Number(match[4])]) + 'Hundred ' : '';
  str += (match[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(match[5])] || b[Number(match[5][0])] + ' ' + a[Number(match[5][1])]) + 'Only ' : 'Only';
  
  return str.trim() || 'Zero Only';
}

// Helper to get local date in YYYY-MM-DD format regardless of timezone differences
export function getLocalIsoDate(date: Date = new Date()): string {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
}
