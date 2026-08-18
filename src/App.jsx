import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { Search, ArrowUpRight, ArrowDownRight, Wallet, BarChart2, Sliders } from 'lucide-react';

// Stock initial data generator
const INITIAL_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.42, high: 130.20, low: 126.10, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.15, change: -1.85, high: 215.00, low: 208.50, volume: '32.1M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 0.95, high: 226.00, low: 223.10, volume: '28.9M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.20, change: -0.45, high: 180.50, low: 177.00, volume: '19.4M' },
];

function generateHistoricalCandles(basePrice) {
  const data = [];
  const volumeData = [];
  const smaData = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 60; i >= 0; i--) {
    const time = now - i * 60;
    const open = currentPrice + (Math.random() - 0.5) * 1.5;
    const high = Math.max(open, open + Math.random() * 2);
    const low = Math.min(open, open - Math.random() * 2);
    const close = low + Math.random() * (high - low);
    currentPrice = close;

    data.push({ time, open, high, low, close });
    volumeData.push({
      time,
      value: Math.floor(Math.random() * 5000) + 1000,
      color: close >= open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
    });
  }

  for (let i = 0; i < data.length; i++) {
    if (i < 20) continue;
    const slice = data.slice(i - 20, i);
    const avg = slice.reduce((sum, item) => sum + item.close, 0) / 20;
    smaData.push({ time: data[i].time, value: avg });
  }

  return { candles: data, volumes: volumeData, sma: smaData };
}

function TradingViewChart({ activeStock, showSMA }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#64748b',
        fontFamily: 'sans-serif',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale: { borderColor: '#1e293b', timeVisible: true, secondsVisible: false },
      autoSize: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const { candles, volumes, sma } = generateHistoricalCandles(activeStock.price);
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);

    if (showSMA) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#6366f1',
        lineWidth: 2,
      });
      smaSeries.setData(sma);
    }

    const interval = setInterval(() => {
      const lastCandle = candles[candles.length - 1];
      const delta = (Math.random() - 0.48) * 1.2;
      const newClose = Math.max(1, lastCandle.close + delta);
      const updatedCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, newClose),
        low: Math.min(lastCandle.low, newClose),
        close: newClose,
      };

      candleSeries.update(updatedCandle);
    }, 2000);

    return () => {
      clearInterval(interval);
      chart.remove();
    };
  }, [activeStock.symbol, showSMA]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}

export default function App() {
  const [stocks] = useState(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [timeframe, setTimeframe] = useState('5M');
  const [showSMA, setShowSMA] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white font-black w-7 h-7 rounded flex items-center justify-center text-xs">PT</div>
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

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* Watchlist Sidebar (Column 3) */}
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

        {/* Chart Workspace (Column 6) */}
        <main className="col-span-6 p-3 flex flex-col gap-3 overflow-y-auto bg-slate-950">
          
          {/* Header Banner */}
          <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black m-0">{activeStock.symbol}</h2>
                <span className="text-xs text-slate-400">{activeStock.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xl font-bold text-white">${activeStock.price.toFixed(2)}</span>
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeStock.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}>
                  {activeStock.change >= 0 ? `+${activeStock.change}%` : `${activeStock.change}%`}
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-[10px] text-slate-400">
              <div><span className="block text-slate-500">24h High</span><span className="font-mono text-slate-200 font-semibold">${activeStock.high}</span></div>
              <div><span className="block text-slate-500">24h Low</span><span className="font-mono text-slate-200 font-semibold">${activeStock.low}</span></div>
              <div><span className="block text-slate-500">Volume</span><span className="font-mono text-slate-200 font-semibold">{activeStock.volume}</span></div>
            </div>
          </div>

          {/* Chart Controls Bar */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 px-3 py-2 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <BarChart2 size={14} className="text-indigo-400 mr-1" />
              <span className="text-xs font-bold text-slate-400 mr-2">Candlestick Engine</span>
              {['1M', '5M', '1H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    timeframe === tf ? 'bg-slate-800 text-indigo-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer flex items-center gap-1 ${
                showSMA ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'text-slate-400 border-slate-800'
              }`}
            >
              <Sliders size={11} /> SMA (20)
            </button>
          </div>

          {/* Chart Canvas */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 h-80 overflow-hidden">
            <TradingViewChart activeStock={activeStock} showSMA={showSMA} />
          </div>

          {/* Order Book */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Execution Order Book</h3>
            {trades.length === 0 ? (
              <p className="text-[11px] text-slate-500 m-0">No trades executed in this session.</p>
            ) : (
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="text-slate-500 text-left border-b border-slate-800">
                    <th className="pb-1">Type</th>
                    <th className="pb-1">Asset</th>
                    <th className="pb-1">Qty</th>
                    <th className="pb-1">Executed Price</th>
                    <th className="pb-1 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-slate-800/40">
                      <td className={`py-1 font-bold ${t.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type}</td>
                      <td className="py-1 font-semibold">{t.symbol}</td>
                      <td className="py-1">{t.qty}</td>
                      <td className="font-mono py-1">${t.price.toFixed(2)}</td>
                      <td className="font-mono py-1 text-right text-slate-400">{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Right Order Panel (Column 3) */}
        <aside className="col-span-3 border-l border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold m-0">Order Panel</h3>

          <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded border border-slate-700">
            <button
              onClick={() => setOrderType('BUY')}
              className={`py-1.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                orderType === 'BUY' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setOrderType('SELL')}
              className={`py-1.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                orderType === 'SELL' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="font-mono w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded border border-slate-800 text-[11px]">
              <div className="flex justify-between mb-1 text-slate-400">
                <span>Market Price</span>
                <span className="font-mono text-white">${activeStock.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Total Value</span>
                <span className="font-mono">${(activeStock.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleExecuteOrder}
              className={`w-full py-2.5 rounded font-bold text-xs text-white cursor-pointer mt-1 ${
                orderType === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              Place {orderType} Order
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
