import React from 'react';

export default function OrderPanel({ 
  executionType,
  setExecutionType,
  targetPrice,
  setTargetPrice,
  orderType, 
  setOrderType, 
  quantity, 
  setQuantity, 
  activeStock, 
  handleExecuteOrder 
}) {
  const calculatedValue = (activeStock.price * quantity).toFixed(2);

  return (
    <aside className="col-span-3 border-l border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-4">
      <h3 className="text-xs font-bold m-0 uppercase tracking-wider text-slate-400">Order Execution</h3>

      {/* Buy / Sell Toggle */}
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

      {/* Execution Type Selector */}
      <div>
        <label className="text-[10px] text-slate-400 block mb-1">Execution Mode</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
          {['MARKET', 'LIMIT', 'STOP_LOSS'].map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setExecutionType(mode);
                if (mode !== 'MARKET' && targetPrice === 0) {
                  setTargetPrice(activeStock.price);
                }
              }}
              className={`py-1 rounded font-bold cursor-pointer transition-colors ${
                executionType === mode 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Form Inputs */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Quantity (Shares)</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="font-mono w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-indigo-500"
          />
        </div>

        {executionType !== 'MARKET' && (
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              {executionType === 'LIMIT' ? 'Target Limit Price ($)' : 'Stop Trigger Price ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="font-mono w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="bg-slate-800/50 p-2.5 rounded border border-slate-800 text-[11px]">
          <div className="flex justify-between mb-1 text-slate-400">
            <span>Current Market Price</span>
            <span className="font-mono text-white">${activeStock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-white">
            <span>Est. Total Value</span>
            <span className="font-mono">${calculatedValue}</span>
          </div>
        </div>

        <button
          onClick={handleExecuteOrder}
          className={`w-full py-2.5 rounded font-bold text-xs text-white cursor-pointer mt-1 ${
            orderType === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
          }`}
        >
          {executionType === 'MARKET' 
            ? `Place ${orderType} Market Order`
            : `Set ${orderType} ${executionType.replace('_', ' ')} Order`
          }
        </button>
      </div>
    </aside>
  );
}