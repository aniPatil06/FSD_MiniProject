import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { BarChart2, Sliders } from 'lucide-react';

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

function TradingCanvas({ activeStock, showSMA }) {
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

export default function ChartSection({ activeStock, showSMA, setShowSMA, timeframe, setTimeframe }) {
  return (
    <>
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

      <div className="bg-slate-900 rounded-lg border border-slate-800 h-80 overflow-hidden">
        <TradingCanvas activeStock={activeStock} showSMA={showSMA} />
      </div>
    </>
  );
}