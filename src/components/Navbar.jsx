import React from 'react';
import { useTrading } from '../context/TradingContext';

// Pass onOpenAuth as a prop from App.jsx
export default function Navbar({ onOpenAuth }) {
  const { balance, positions, setCurrentPage, currentPage } = useTrading();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex justify-between items-center select-none">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xs">PT</div>
          <span className="font-bold text-base text-slate-100">PulseTrade <span className="text-blue-500 text-xs">PRO</span></span>
        </div>

        {/* Dynamic View Navigation */}
        <nav className="flex space-x-1 text-xs">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${currentPage === 'dashboard' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Terminal
          </button>
          <button 
            onClick={() => setCurrentPage('holdings')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${currentPage === 'holdings' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Holdings
          </button>
          <button 
            onClick={() => setCurrentPage('orders')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${currentPage === 'orders' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Orders
          </button>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* Sign In / Auth Button */}
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