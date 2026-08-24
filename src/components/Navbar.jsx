import React from 'react';
import { Wallet, RotateCcw, LayoutDashboard, Briefcase, ListOrdered } from 'lucide-react';
import { useTrading } from '../context/TradingContext';

export default function Navbar() {
  const { balance, resetState, currentPage, setCurrentPage } = useTrading();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'holdings', label: 'Holdings', icon: Briefcase },
    { id: 'orders', label: 'Orders', icon: ListOrdered },
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-5 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white font-black w-7 h-7 rounded flex items-center justify-center text-xs">
            PT
          </div>
          <h1 className="text-sm font-bold text-white flex items-center">
            PulseTrade 
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 ml-2">
              PRO TERMINAL
            </span>
          </h1>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={resetState}
          title="Reset Demo State"
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
        </button>

        <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded border border-slate-700">
          <Wallet size={14} className="text-emerald-400" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block leading-none">Available Funds</span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}