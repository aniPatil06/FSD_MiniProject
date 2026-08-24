import React from 'react';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Watchlist({ 
  filteredStocks, 
  activeStock, 
  setSelectedSymbol, 
  searchQuery, 
  setSearchQuery 
}) {
  return (
    <aside className="col-span-3 border-r border-slate-800 bg-slate-900/50 flex flex-col">
      <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
        <Search size={14} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search Market..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-slate-100 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredStocks.map((stock) => {
          const isSelected = activeStock.symbol === stock.symbol;
          const isPositive = stock.change >= 0;
          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`p-3 cursor-pointer flex justify-between items-center border-b border-slate-800/40 border-l-4 transition-all ${
                isSelected ? 'bg-indigo-950/40 border-l-indigo-500' : 'border-l-transparent hover:bg-slate-800/30'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">{stock.symbol}</span>
                <span className="text-[10px] text-slate-400">{stock.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-semibold block">${stock.price.toFixed(2)}</span>
                <span className={`font-mono text-[10px] font-bold flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {isPositive ? `+${stock.change}%` : `${stock.change}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}