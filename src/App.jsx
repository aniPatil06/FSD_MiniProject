import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Watchlist from './components/Watchlist';
import ChartSection from './components/ChartSection';
import OrderBook from './components/OrderBook';
import OrderPanel from './components/OrderPanel';
import Portfolio from './components/Portfolio';

const INITIAL_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.42, high: 130.20, low: 126.10, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.15, change: -1.85, high: 215.00, low: 208.50, volume: '32.1M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 0.95, high: 226.00, low: 223.10, volume: '28.9M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.20, change: -0.45, high: 180.50, low: 177.00, volume: '19.4M' },
];

export default function App() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [timeframe, setTimeframe] = useState('5M');
  const [showSMA, setShowSMA] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');

  // Trading & Persistence State
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState('BUY');

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pt_balance');
    return saved ? JSON.parse(saved) : 100000.00;
  });

  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('pt_trades');
    return saved ? JSON.parse(saved) : [];
  });

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('pt_positions');
    return saved ? JSON.parse(saved) : {};
  });

  // Real-Time Stock Price Simulation Engine (Ticks every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const deltaPercent = (Math.random() - 0.49) * 0.8; // Random walk -0.4% to +0.4%
          const newPrice = Math.max(1, stock.price * (1 + deltaPercent / 100));
          const updatedChange = parseFloat((stock.change + deltaPercent).toFixed(2));

          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: updatedChange,
            high: Math.max(stock.high, parseFloat(newPrice.toFixed(2))),
            low: Math.min(stock.low, parseFloat(newPrice.toFixed(2))),
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('pt_balance', JSON.stringify(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('pt_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('pt_positions', JSON.stringify(positions));
  }, [positions]);

  const activeStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteOrder = () => {
    const totalCost = activeStock.price * quantity;
    const currentPosition = positions[activeStock.symbol] || { qty: 0, avgPrice: 0 };

    if (orderType === 'BUY') {
      if (balance < totalCost) {
        alert('Insufficient Funds!');
        return;
      }
      setBalance((prev) => parseFloat((prev - totalCost).toFixed(2)));

      const newQty = currentPosition.qty + quantity;
      const newTotalCost = (currentPosition.qty * currentPosition.avgPrice) + totalCost;
      const newAvgPrice = newTotalCost / newQty;

      setPositions((prev) => ({
        ...prev,
        [activeStock.symbol]: { qty: newQty, avgPrice: newAvgPrice },
      }));
    } else {
      if (currentPosition.qty < quantity) {
        alert(`Cannot SELL: You only own ${currentPosition.qty} shares of ${activeStock.symbol}`);
        return;
      }
      setBalance((prev) => parseFloat((prev + totalCost).toFixed(2)));

      const newQty = currentPosition.qty - quantity;
      setPositions((prev) => ({
        ...prev,
        [activeStock.symbol]: {
          qty: newQty,
          avgPrice: newQty === 0 ? 0 : currentPosition.avgPrice,
        },
      }));
    }

    setTrades((prev) => [
      { id: Date.now(), symbol: activeStock.symbol, qty: quantity, price: activeStock.price, type: orderType, time: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Reset account balance, positions, and trade history?')) {
      setBalance(100000.00);
      setTrades([]);
      setPositions({});
      localStorage.clear();
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar balance={balance} onReset={handleClearHistory} />

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <Watchlist 
          filteredStocks={filteredStocks} 
          activeStock={activeStock} 
          setSelectedSymbol={setSelectedSymbol} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="col-span-6 p-3 flex flex-col gap-3 overflow-y-auto bg-slate-950">
          <ChartSection 
            activeStock={activeStock} 
            showSMA={showSMA} 
            setShowSMA={setShowSMA} 
            timeframe={timeframe} 
            setTimeframe={setTimeframe} 
          />

          <div className="flex gap-2 border-b border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Portfolio & P&L
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Order Book ({trades.length})
            </button>
          </div>

          {activeTab === 'portfolio' ? (
            <Portfolio positions={positions} stocks={stocks} />
          ) : (
            <OrderBook trades={trades} />
          )}
        </main>

        <OrderPanel 
          orderType={orderType} 
          setOrderType={setOrderType} 
          quantity={quantity} 
          setQuantity={setQuantity} 
          activeStock={activeStock} 
          handleExecuteOrder={handleExecuteOrder} 
        />
      </div>
    </div>
  );
}