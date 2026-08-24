import React from 'react';

export default function OrderPanel({ 
  orderType, 
  setOrderType, 
  quantity, 
  setQuantity, 
  activeStock, 
  handleExecuteOrder 
}) {
  return (
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
  );
}