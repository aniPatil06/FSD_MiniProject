import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { Search, ArrowUpRight, ArrowDownRight, Wallet, Activity, BarChart2, Sliders } from 'lucide-react';

// Stock initial data generator
const INITIAL_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.42, high: 130.20, low: 126.10, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.15, change: -1.85, high: 215.00, low: 208.50, volume: '32.1M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 0.95, high: 226.00, low: 223.10, volume: '28.9M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.20, change: -0.45, high: 180.50, low: 177.00, volume: '19.4M' },
];

// Helper to generate mock historical candlestick data
function generateHistoricalCandles(basePrice) {
  const data = [];
  const volumeData = [];
  const smaData = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 60; i >= 0; i--) {
    const time = (now - i * 60) ;
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

  // Calculate Simple Moving Average (20-period)
  for (let i = 0; i < data.length; i++) {
    if (i < 20) continue;
    const slice = data.slice(i - 20, i);
    const avg = slice.reduce((sum, item) => sum + item.close, 0) / 20;
    smaData.push({ time: data[i].time, value: avg });
  }

  return { candles: data, volumes: volumeData, sma: smaData };
}

// TradingView Lightweight Candlestick Component
function TradingViewChart({ activeStock, showSMA }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create TradingView Chart Instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0e1626' },
        textColor: '#64748b',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candlestickSeriesRef.current = candleSeries;

    // Add Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Populate Initial Data
    const { candles, volumes, sma } = generateHistoricalCandles(activeStock.price);
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);

    // Optional SMA Line Series
    let smaSeries = null;
    if (showSMA) {
      smaSeries = chart.addSeries(LineSeries, {
        color: '#6366f1',
        lineWidth: 2,
      });
      smaSeries.setData(sma);
    }

    // Live Ticks Simulation
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

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
}

export default function App() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#080c14', color: '#f1f5f9' }}>
      
      {/* Top Header */}
      <header style={{ height: '52px', borderBottom: '1px solid #1e293b', backgroundColor: '#0e1626', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '800', width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>PT</div>
          <h1 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', margin: 0, color: '#fff' }}>
            PulseTrade <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px', backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.3)', marginLeft: '6px' }}>PRO TERMINAL</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#131d31', padding: '5px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <Wallet size={14} color="#10b981" />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#64748b', display: 'block', lineHeight: '1' }}>Available Funds</span>
            <span className="font-mono-num" style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', lineHeight: '1.2' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 300px', overflow: 'hidden' }}>
        
        {/* Watchlist Sidebar */}
        <aside style={{ borderRight: '1px solid #1e293b', backgroundColor: '#0b111e', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0e1626' }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search Market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '12px' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredStocks.map((stock) => {
              const isSelected = activeStock.symbol === stock.symbol;
              const isPositive = stock.change >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #172033',
                    backgroundColor: isSelected ? '#131d33' : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '13px', display: 'block' }}>{stock.symbol}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{stock.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="font-mono-num" style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>${stock.price.toFixed(2)}</span>
                    <span className="font-mono-num" style={{ fontSize: '11px', fontWeight: '700', color: isPositive ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {isPositive ? `+${stock.change}%` : `${stock.change}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Chart Workspace */}
        <main style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', backgroundColor: '#080c14' }}>
          
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0e1626', padding: '12px 18px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{activeStock.symbol}</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{activeStock.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span className="font-mono-num" style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>${activeStock.price.toFixed(2)}</span>
                <span className="font-mono-num" style={{ fontSize: '11px', fontWeight: '700', color: activeStock.change >= 0 ? '#10b981' : '#f43f5e', backgroundColor: activeStock.change >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {activeStock.change >= 0 ? `+${activeStock.change}%` : `${activeStock.change}%`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: '#64748b' }}>
              <div><span style={{ display: 'block', color: '#475569' }}>24h High</span><span className="font-mono-num" style={{ color: '#f1f5f9', fontWeight: '600' }}>${activeStock.high}</span></div>
              <div><span style={{ display: 'block', color: '#475569' }}>24h Low</span><span className="font-mono-num" style={{ color: '#f1f5f9', fontWeight: '600' }}>${activeStock.low}</span></div>
              <div><span style={{ display: 'block', color: '#475569' }}>Volume</span><span className="font-mono-num" style={{ color: '#f1f5f9', fontWeight: '600' }}>{activeStock.volume}</span></div>
            </div>
          </div>

          {/* Chart Controls Bar */}
          <div style={{ backgroundColor: '#0e1626', borderRadius: '8px', border: '1px solid #1e293b', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={15} color="#6366f1" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginRight: '10px' }}>Candlestick Engine</span>
              {['1M', '5M', '1H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    backgroundColor: timeframe === tf ? '#131d31' : 'transparent',
                    color: timeframe === tf ? '#6366f1' : '#64748b',
                    border: timeframe === tf ? '1px solid #1e293b' : 'none',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setShowSMA(!showSMA)}
                style={{
                  backgroundColor: showSMA ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: showSMA ? '#818cf8' : '#64748b',
                  border: '1px solid #1e293b',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sliders size={12} /> SMA (20)
              </button>
            </div>
          </div>

          {/* Candlestick Canvas Container */}
          <div style={{ backgroundColor: '#0e1626', borderRadius: '8px', border: '1px solid #1e293b', height: '360px', overflow: 'hidden' }}>
            <TradingViewChart activeStock={activeStock} showSMA={showSMA} />
          </div>

          {/* Execution Order Book */}
          <div style={{ backgroundColor: '#0e1626', borderRadius: '8px', border: '1px solid #1e293b', padding: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '700', margin: '0 0 10px 0', color: '#64748b', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Execution Order Book</h3>
            {trades.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>No trades executed in this session.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ color: '#475569', textAlign: 'left', borderBottom: '1px solid #1e293b' }}>
                    <th style={{ paddingBottom: '6px' }}>Type</th>
                    <th style={{ paddingBottom: '6px' }}>Asset</th>
                    <th style={{ paddingBottom: '6px' }}>Qty</th>
                    <th style={{ paddingBottom: '6px' }}>Executed Price</th>
                    <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #172033' }}>
                      <td style={{ padding: '6px 0', fontWeight: '700', color: t.type === 'BUY' ? '#10b981' : '#f43f5e' }}>{t.type}</td>
                      <td style={{ padding: '6px 0', fontWeight: '600' }}>{t.symbol}</td>
                      <td style={{ padding: '6px 0' }}>{t.qty}</td>
                      <td className="font-mono-num" style={{ padding: '6px 0' }}>${t.price.toFixed(2)}</td>
                      <td className="font-mono-num" style={{ padding: '6px 0', textAlign: 'right', color: '#64748b' }}>{t.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Right Order Panel */}
        <aside style={{ borderLeft: '1px solid #1e293b', backgroundColor: '#0b111e', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Order Panel</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: '#131d31', padding: '3px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setOrderType('BUY')}
              style={{
                backgroundColor: orderType === 'BUY' ? '#10b981' : 'transparent',
                color: orderType === 'BUY' ? '#fff' : '#64748b',
                border: 'none',
                padding: '7px',
                borderRadius: '4px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              BUY
            </button>
            <button
              onClick={() => setOrderType('SELL')}
              style={{
                backgroundColor: orderType === 'SELL' ? '#f43f5e' : 'transparent',
                color: orderType === 'SELL' ? '#fff' : '#64748b',
                border: 'none',
                padding: '7px',
                borderRadius: '4px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              SELL
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="font-mono-num"
                style={{ width: '100%', backgroundColor: '#080c14', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ backgroundColor: '#131d31', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                <span>Market Price</span>
                <span className="font-mono-num" style={{ color: '#fff' }}>${activeStock.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#fff' }}>
                <span>Total Value</span>
                <span className="font-mono-num">${(activeStock.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleExecuteOrder}
              style={{
                backgroundColor: orderType === 'BUY' ? '#10b981' : '#f43f5e',
                color: '#fff',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Place {orderType} Order
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}