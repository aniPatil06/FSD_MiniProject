import React from 'react';
import { useTrading } from '../context/TradingContext';

export default function Navbar({ onOpenAuth }) {
  const { balance, resetAccount, setCurrentPage, currentPage } = useTrading();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex justify-between items-center select-none shrink-0">
      
      {/* Left side: Brand & Navigation Tabs */}
      <div className="flex items-center space-x-6">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => setCurrentPage('dashboard')}
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xs">PT</div>
          <span className="font-bold text-base text-slate-100">
            PulseTrade <span className="text-blue-500 text-xs">PRO</span>
          </span>
        </div>

        <nav className="flex space-x-1 text-xs">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              currentPage === 'dashboard' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setCurrentPage('holdings')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              currentPage === 'holdings' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Holdings
          </button>
          <button 
            onClick={() => setCurrentPage('orders')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              currentPage === 'orders' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Orders
          </button>
        </nav>
      </div>

      {/* Right side: Balance Display, Reset Button & Auth Modal Trigger */}
      <div className="flex items-center space-x-4">
        
        {/* Available Cash Balance */}
        <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Available:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Reset Account Button */}
        <button
          onClick={resetAccount}
          title="Reset portfolio to initial cash"
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
        >
          Reset Demo Account
        </button>

        {/* Auth Modal Trigger Button */}
        <button 
          onClick={onOpenAuth}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-600/30"
        >
          Sign In / Register
        </button>
      </div>

    </header>
  );
}