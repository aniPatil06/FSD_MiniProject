import React from 'react';

export default function SystemStatus() {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400 select-none">
      <div className="flex items-center space-x-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-400 font-semibold font-sans">Trading Engine Active</span>
        <span className="text-slate-600">•</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider">
          CI/CD AUTO-DEPLOYED
        </span>
        <span className="text-slate-500 text-[11px] hidden md:inline">v1.0.1</span>
      </div>
    </div>
  );
}