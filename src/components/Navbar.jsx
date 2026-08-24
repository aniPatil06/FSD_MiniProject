import React from 'react';
import { Wallet } from 'lucide-react';

export default function Navbar({ balance }) {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 px-5 flex justify-between items-center shrink-0">
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

      <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded border border-slate-700">
        <Wallet size={14} className="text-emerald-400" />
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block leading-none">Available Funds</span>
          <span className="font-mono text-xs font-bold text-emerald-400">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </header>
  );
}