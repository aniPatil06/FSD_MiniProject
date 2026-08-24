import React from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function Watchlist({ filteredStocks, activeStock, setSelectedSymbol, searchQuery, setSearchQuery }) {
  return (
    <div className="h-full flex flex-col bg-slate-900 select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search eg: NVDA, TSLA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Ticker List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {filteredStocks.map((stock) => {
          const isActive = activeStock?.symbol === stock.symbol;
          const isPositive = stock.change >= 0;

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`p-3 flex justify-between items-center cursor-pointer transition-colors group ${
                isActive ? 'bg-slate-800/80 border-l-2 border-indigo-500' : 'hover:bg-slate-800/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{stock.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vol: {stock.volume}</div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-semibold text-slate-200">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end gap-0.5 font-mono text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}