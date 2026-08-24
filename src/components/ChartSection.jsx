import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function ChartSection({ activeStock, showSMA, setShowSMA, timeframe, setTimeframe }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const lastCandleRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: '#334155',
        autoScale: true,
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    // Anchor historical candles directly around the LIVE ACTIVE PRICE
    const mockData = [];
    const now = Math.floor(Date.now() / 1000);
    const totalBars = 60;
    const intervalSeconds = timeframe === '1M' ? 60 : timeframe === '15M' ? 900 : 300;

    // Work BACKWARDS from activeStock.price so the current price connects seamlessly
    let runningPrice = activeStock.price;
    
    for (let i = 0; i <= totalBars; i++) {
      const time = now - i * intervalSeconds;
      const change = (Math.random() - 0.49) * 0.4; // Small micro ticks ($0.40 spread)
      
      const close = runningPrice;
      const open = close - change;
      const high = Math.max(open, close) + Math.random() * 0.15;
      const low = Math.min(open, close) - Math.random() * 0.15;

      mockData.unshift({
        time,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });

      runningPrice = open; // Step backwards
    }

    const lastBar = mockData[mockData.length - 1];
    lastCandleRef.current = { ...lastBar };

    candlestickSeries.setData(mockData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [activeStock.symbol, timeframe]);

  // Update live candle smoothly
  useEffect(() => {
    if (seriesRef.current && lastCandleRef.current) {
      const price = activeStock.price;
      const updated = {
        ...lastCandleRef.current,
        high: Math.max(lastCandleRef.current.high, price),
        low: Math.min(lastCandleRef.current.low, price),
        close: price,
      };
      lastCandleRef.current = updated;
      seriesRef.current.update(updated);
    }
  }, [activeStock.price]);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-3 flex flex-col h-[380px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white m-0">{activeStock.symbol}</h2>
          <span className="text-xs text-slate-400">{activeStock.name}</span>
          <span className={`text-xs font-mono font-bold ${activeStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${activeStock.price.toFixed(2)} ({activeStock.change >= 0 ? '+' : ''}{activeStock.change.toFixed(2)}%)
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
              showSMA 
                ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            SMA (20)
          </button>
          <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
            {['1M', '5M', '15M', '1H', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                  timeframe === tf ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={chartContainerRef} className="flex-1 w-full relative min-h-0" />
    </div>
  );
}