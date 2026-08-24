import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Portfolio({ positions, stocks }) {
  // Map positions with current live stock market prices
  const holdingList = Object.entries(positions)
    .filter(([_, data]) => data.qty > 0)
    .map(([symbol, data]) => {
      const currentStock = stocks.find((s) => s.symbol === symbol);
      const currentPrice = currentStock ? currentStock.price : data.avgPrice;
      const currentValue = data.qty * currentPrice;
      const totalInvested = data.qty * data.avgPrice;
      const pnl = currentValue - totalInvested;
      const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

      return {
        symbol,
        qty: data.qty,
        avgPrice: data.avgPrice,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
      };
    });

  const totalPortfolioValue = holdingList.reduce((acc, h) => acc + h.currentValue, 0);
  const totalPnL = holdingList.reduce((acc, h) => acc + h.pnl, 0);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">
          Open Positions & Portfolio Performance
        </h3>
        <div className="flex gap-3 text-xs font-mono">
          <span className="text-slate-400">
            Holdings Value: <strong className="text-white">${totalPortfolioValue.toFixed(2)}</strong>
          </span>
          <span className={totalPnL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
            Net P&L: {totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
          </span>
        </div>
      </div>

      {holdingList.length === 0 ? (
        <p className="text-[11px] text-slate-500 m-0 py-2">No open stock positions held.</p>
      ) : (
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="text-slate-500 text-left border-b border-slate-800">
              <th className="pb-1">Asset</th>
              <th className="pb-1">Shares</th>
              <th className="pb-1">Avg Price</th>
              <th className="pb-1">Current Price</th>
              <th className="pb-1">Market Value</th>
              <th className="pb-1 text-right">Unrealized P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdingList.map((h) => {
              const isProfit = h.pnl >= 0;
              return (
                <tr key={h.symbol} className="border-b border-slate-800/40 font-mono">
                  <td className="py-1 font-sans font-bold text-white">{h.symbol}</td>
                  <td className="py-1">{h.qty}</td>
                  <td className="py-1">${h.avgPrice.toFixed(2)}</td>
                  <td className="py-1">${h.currentPrice.toFixed(2)}</td>
                  <td className="py-1 text-slate-200">${h.currentValue.toFixed(2)}</td>
                  <td className={`py-1 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span className="flex items-center justify-end gap-1">
                      {isProfit ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {isProfit ? `+$${h.pnl.toFixed(2)} (${h.pnlPercent.toFixed(2)}%)` : `-$${Math.abs(h.pnl).toFixed(2)} (${h.pnlPercent.toFixed(2)}%)`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}