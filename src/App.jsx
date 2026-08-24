import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Watchlist from './components/Watchlist';
import ChartSection from './components/ChartSection';
import OrderBook from './components/OrderBook';
import OrderPanel from './components/OrderPanel';

const INITIAL_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.42, high: 130.20, low: 126.10, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.15, change: -1.85, high: 215.00, low: 208.50, volume: '32.1M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 0.95, high: 226.00, low: 223.10, volume: '28.9M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.20, change: -0.45, high: 180.50, low: 177.00, volume: '19.4M' },
];

export default function App() {
  const [stocks] = useState(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [timeframe, setTimeframe] = useState('5M');
  const [showSMA, setShowSMA] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trading State
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState('BUY');
  const [balance, setBalance] = useState(100000.00);
  const [trades, setTrades] = useState([]);

  const activeStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteOrder = () => {
    const totalCost = activeStock.price * quantity;
    if (orderType === 'BUY') {
      if (balance >= totalCost) {
        setBalance((prev) => parseFloat((prev - totalCost).toFixed(2)));
        setTrades((prev) => [
          { id: Date.now(), symbol: activeStock.symbol, qty: quantity, price: activeStock.price, type: 'BUY', time: new Date().toLocaleTimeString() },
          ...prev,
        ]);
      } else {
        alert('Insufficient Funds!');
      }
    } else {
      setBalance((prev) => parseFloat((prev + totalCost).toFixed(2)));
      setTrades((prev) => [
        { id: Date.now(), symbol: activeStock.symbol, qty: quantity, price: activeStock.price, type: 'SELL', time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar balance={balance} />
      
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
          <OrderBook trades={trades} />
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