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

  // Form State
  const [quantity, setQuantity] = useState(10);
  const [orderType, setOrderType] = useState('BUY');
  const [executionType, setExecutionType] = useState('MARKET');
  const [targetPrice, setTargetPrice] = useState(0);

  // Persistent State
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

  const [pendingOrders, setPendingOrders] = useState(() => {
    const saved = localStorage.getItem('pt_pending');
    return saved ? JSON.parse(saved) : [];
  });

  // Ticker Engine & Conditional Order Matching
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.map((stock) => {
          const deltaPercent = (Math.random() - 0.49) * 0.8;
          const newPrice = Math.max(1, stock.price * (1 + deltaPercent / 100));
          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((stock.change + deltaPercent).toFixed(2)),
            high: Math.max(stock.high, parseFloat(newPrice.toFixed(2))),
            low: Math.min(stock.low, parseFloat(newPrice.toFixed(2))),
          };
        });

        // Evaluate Pending Limit & Stop-Loss Trigger Conditions
        setPendingOrders((prevPending) => {
          const remaining = [];
          
          prevPending.forEach((order) => {
            const currentStock = updatedStocks.find((s) => s.symbol === order.symbol);
            if (!currentStock) return;

            let isTriggered = false;
            if (order.executionType === 'LIMIT') {
              if (order.type === 'BUY' && currentStock.price <= order.targetPrice) isTriggered = true;
              if (order.type === 'SELL' && currentStock.price >= order.targetPrice) isTriggered = true;
            } else if (order.executionType === 'STOP_LOSS') {
              if (order.type === 'SELL' && currentStock.price <= order.targetPrice) isTriggered = true;
            }

            if (isTriggered) {
              executeOrderDirectly(order, currentStock.price);
            } else {
              remaining.push(order);
            }
          });

          return remaining;
        });

        return updatedStocks;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [positions, balance]);

  useEffect(() => {
    localStorage.setItem('pt_balance', JSON.stringify(balance));
    localStorage.setItem('pt_trades', JSON.stringify(trades));
    localStorage.setItem('pt_positions', JSON.stringify(positions));
    localStorage.setItem('pt_pending', JSON.stringify(pendingOrders));
  }, [balance, trades, positions, pendingOrders]);

  const activeStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeOrderDirectly = (order, fillPrice) => {
    const totalCost = fillPrice * order.qty;
    const currentPos = positions[order.symbol] || { qty: 0, avgPrice: 0 };

    if (order.type === 'BUY') {
      if (balance < totalCost) return;
      setBalance((prev) => parseFloat((prev - totalCost).toFixed(2)));

      const newQty = currentPos.qty + order.qty;
      const newTotalCost = (currentPos.qty * currentPos.avgPrice) + totalCost;
      setPositions((prev) => ({
        ...prev,
        [order.symbol]: { qty: newQty, avgPrice: newTotalCost / newQty },
      }));
    } else {
      if (currentPos.qty < order.qty) return;
      setBalance((prev) => parseFloat((prev + totalCost).toFixed(2)));

      const newQty = currentPos.qty - order.qty;
      setPositions((prev) => ({
        ...prev,
        [order.symbol]: {
          qty: newQty,
          avgPrice: newQty === 0 ? 0 : currentPos.avgPrice,
        },
      }));
    }

    setTrades((prev) => [
      {
        id: Date.now(),
        symbol: order.symbol,
        qty: order.qty,
        price: fillPrice,
        type: `${order.type} (${order.executionType || 'MARKET'})`,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  const handleExecuteOrder = () => {
    if (executionType === 'MARKET') {
      executeOrderDirectly({ symbol: activeStock.symbol, qty: quantity, type: orderType, executionType: 'MARKET' }, activeStock.price);
    } else {
      // Create Pending Conditional Order
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

  const handleClearHistory = () => {
    if (window.confirm('Reset account balance, pending orders, positions, and history?')) {
      setBalance(100000.00);
      setTrades([]);
      setPositions({});
      setPendingOrders([]);
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
              Order Book ({trades.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                activeTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Triggers ({pendingOrders.length})
            </button>
          </div>

          {activeTab === 'portfolio' && <Portfolio positions={positions} stocks={stocks} />}
          {activeTab === 'orders' && <OrderBook trades={trades} />}
          {activeTab === 'pending' && (
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Trigger Queue</h3>
              {pendingOrders.length === 0 ? (
                <p className="text-[11px] text-slate-500 m-0 py-1">No active Limit or Stop-Loss triggers queued.</p>
              ) : (
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-left border-b border-slate-800">
                      <th className="pb-1">Asset</th>
                      <th className="pb-1">Mode</th>
                      <th className="pb-1">Side</th>
                      <th className="pb-1">Qty</th>
                      <th className="pb-1 text-right">Target Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-800/40 font-mono">
                        <td className="py-1 font-bold font-sans text-white">{o.symbol}</td>
                        <td className="py-1 text-indigo-400 font-semibold">{o.executionType}</td>
                        <td className={`py-1 font-bold ${o.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{o.type}</td>
                        <td className="py-1">{o.qty}</td>
                        <td className="py-1 text-right font-bold text-slate-200">${o.targetPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>

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
  );
}