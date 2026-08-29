import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Watchlist from './components/Watchlist';
import ChartSection from './components/ChartSection';
import OrderBook from './components/OrderBook';
import OrderPanel from './components/OrderPanel';
import Portfolio from './components/Portfolio';
import AuthModal from './components/AuthModal';
import { useTrading } from './context/TradingContext';

export default function App() {
  const { 
    currentPage, 
    stocks, 
    setSelectedSymbol, 
    activeStock, 
    positions, 
    trades, 
    pendingOrders, 
    executeOrderDirectly, 
    setPendingOrders 
  } = useTrading();

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [timeframe, setTimeframe] = useState('5M');
  const [showSMA, setShowSMA] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Order Panel Local Form State
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState('BUY');
  const [executionType, setExecutionType] = useState('MARKET');
  const [targetPrice, setTargetPrice] = useState(0);

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteOrder = () => {
    if (executionType === 'MARKET') {
      executeOrderDirectly({ symbol: activeStock.symbol, qty: quantity, type: orderType, executionType: 'MARKET' }, activeStock.price);
    } else {
      const newPendingOrder = {
        id: Date.now(),
        symbol: activeStock.symbol,
        qty: quantity,
        type: orderType,
        executionType,
        targetPrice: targetPrice || activeStock.price,
      };
      setPendingOrders((prev) => [...prev, newPendingOrder]);
      alert(`Pending ${executionType} Order placed for ${activeStock.symbol} at $${targetPrice}`);
    }
  };

  return (
    <div className="w-screen min-h-screen md:h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-x-hidden md:overflow-hidden">
      
      {/* Navbar with Auth Toggle Handler */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Auth Modal Component */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
        
        {/* Watchlist Sidebar: Collapsible height on mobile, fixed width on tablet/desktop */}
        <div className="w-full md:w-64 lg:w-80 border-b md:border-b-0 md:border-r border-slate-800 shrink-0 max-h-60 md:max-h-none overflow-y-auto">
          <Watchlist 
            filteredStocks={filteredStocks} 
            activeStock={activeStock} 
            setSelectedSymbol={setSelectedSymbol} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>

        {/* Dynamic Main View Switcher */}
        <div className="flex-1 flex overflow-y-auto md:overflow-hidden min-h-0">
          {currentPage === 'dashboard' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden h-full">
              
              {/* Main Chart and Holdings Section */}
              <main className="col-span-1 lg:col-span-8 p-3 flex flex-col gap-3 overflow-y-auto bg-slate-950 min-h-0">
                <ChartSection 
                  showSMA={showSMA} 
                  setShowSMA={setShowSMA} 
                  timeframe={timeframe} 
                  setTimeframe={setTimeframe} 
                />
                <Portfolio positions={positions} stocks={stocks} />
              </main>

              {/* Order Panel Section */}
              <div className="col-span-1 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 overflow-y-auto min-h-0">
                <OrderPanel 
                  executionType={executionType}
                  setExecutionType={setExecutionType}
                  targetPrice={targetPrice}
                  setTargetPrice={setTargetPrice}
                  orderType={orderType} 
                  setOrderType={setOrderType} 
                  quantity={quantity} 
                  setQuantity={setQuantity} 
                  activeStock={activeStock} 
                  handleExecuteOrder={handleExecuteOrder} 
                />
              </div>

            </div>
          )}

          {currentPage === 'holdings' && (
            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950">
              <div className="mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Portfolio & Asset Holdings</h2>
                <p className="text-xs text-slate-400 mt-1">Detailed breakdown of open positions, average costs, and net profit/loss performance.</p>
              </div>
              <Portfolio positions={positions} stocks={stocks} />
            </main>
          )}

          {currentPage === 'orders' && (
            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950 flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white">Order Management Book</h2>
                <p className="text-xs text-slate-400 mt-1">Active limit/stop orders and executed transaction history.</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pending Limit / Stop-Loss Triggers</h3>
                {pendingOrders.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded p-4 text-xs text-slate-500 text-center">
                    No active pending conditional orders.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse bg-slate-900 rounded border border-slate-800 min-w-[500px]">
                      <thead>
                        <tr className="text-slate-400 text-left border-b border-slate-800 bg-slate-800/50">
                          <th className="p-3">Asset</th>
                          <th className="p-3">Mode</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3 text-right">Target Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((o) => (
                          <tr key={o.id} className="border-b border-slate-800/40 font-mono hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 font-bold font-sans text-white">{o.symbol}</td>
                            <td className="p-3 text-indigo-400 font-semibold">{o.executionType}</td>
                            <td className={`p-3 font-bold ${o.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{o.type}</td>
                            <td className="p-3">{o.qty}</td>
                            <td className="p-3 text-right font-bold text-slate-200">${Number(o.targetPrice).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Completed Market Trades</h3>
                <OrderBook trades={trades} />
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}