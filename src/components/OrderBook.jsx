import React from 'react';

export default function OrderBook({ trades }) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Execution Order Book</h3>
      {trades.length === 0 ? (
        <p className="text-[11px] text-slate-500 m-0">No trades executed in this session.</p>
      ) : (
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="text-slate-500 text-left border-b border-slate-800">
              <th className="pb-1">Type</th>
              <th className="pb-1">Asset</th>
              <th className="pb-1">Qty</th>
              <th className="pb-1">Executed Price</th>
              <th className="pb-1 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-b border-slate-800/40">
                <td className={`py-1 font-bold ${t.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type}</td>
                <td className="py-1 font-semibold">{t.symbol}</td>
                <td className="py-1">{t.qty}</td>
                <td className="font-mono py-1">${t.price.toFixed(2)}</td>
                <td className="font-mono py-1 text-right text-slate-400">{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}