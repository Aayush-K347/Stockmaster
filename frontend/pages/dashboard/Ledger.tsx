import React from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';

export default function Ledger() {
  const { ledger } = useStore();

  const handleDownload = () => {
    const headers = [
      'Date/Time',
      'Reference',
      'Product',
      'SKU',
      'Location',
      'In (+)',
      'Out (-)',
      'Balance',
      'User',
      'Type',
    ];

    const escapeCsv = (value: string | number) => {
      const safeValue = String(value ?? '');
      if (/[",\n]/.test(safeValue)) {
        return `"${safeValue.replace(/"/g, '""')}"`;
      }
      return safeValue;
    };

    const rows = ledger.map(entry => [
      entry.date,
      entry.reference,
      entry.productName,
      entry.sku,
      entry.location,
      entry.debit,
      entry.credit,
      entry.balance,
      entry.user,
      entry.type,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Stock Ledger</h1>
          <p className="text-gray-400 text-sm">Audit trail of every single movement.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm">
            <ClipboardList size={16} />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm"
            title="Download ledger as CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Date/Time</th>
              <th className="p-4 font-medium">Reference</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium text-green-400 text-right">In (+)</th>
              <th className="p-4 font-medium text-red-400 text-right">Out (-)</th>
              <th className="p-4 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ledger.map(entry => (
              <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400 text-xs font-mono">{entry.date}</td>
                <td className="p-4 text-white font-medium">{entry.reference}</td>
                <td className="p-4">
                  <div className="text-white">{entry.productName}</div>
                  <div className="text-[10px] text-gray-500">{entry.sku}</div>
                </td>
                <td className="p-4 text-gray-300">{entry.location}</td>
                <td className="p-4 text-right text-green-400 font-mono">{entry.debit > 0 ? `+${entry.debit}` : '-'}</td>
                <td className="p-4 text-right text-red-400 font-mono">{entry.credit > 0 ? `-${entry.credit}` : '-'}</td>
                <td className="p-4 text-right font-bold text-white font-mono">{entry.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
