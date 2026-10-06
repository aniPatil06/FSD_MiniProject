import React, { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_STOCKS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.42, high: 130.20, low: 126.10, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.15, change: -1.85, high: 215.00, low: 208.50, volume: '32.1M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 224.30, change: 0.95, high: 226.00, low: 223.10, volume: '28.9M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.20, change: -0.45, high: 180.50, low: 177.00, volume: '19.4M' },
];

const INITIAL_BALANCE = 100000.00;
const INITIAL_POSITIONS = {};

const TradingContext = createContext();

export function TradingProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');

  // Persistence State
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('pt_balance');
    return saved ? JSON.parse(saved) : INITIAL_BALANCE;
  });

  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('pt_trades');
    return saved ? JSON.parse(saved) : [];
  });

  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('pt_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
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

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem('pt_balance', JSON.stringify(balance));
    localStorage.setItem('pt_trades', JSON.stringify(trades));
    localStorage.setItem('pt_positions', JSON.stringify(positions));
    localStorage.setItem('pt_pending', JSON.stringify(pendingOrders));
  }, [balance, trades, positions, pendingOrders]);

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

  // FULL RESET FUNCTION (Aliased for both resetAccount and resetState)
  const resetAccount = () => {
    if (window.confirm('Reset account balance, pending orders, positions, and history?')) {
      // 1. Remove keys explicitly from localStorage
      localStorage.removeItem('pt_balance');
      localStorage.removeItem('pt_trades');
      localStorage.removeItem('pt_positions');
      localStorage.removeItem('pt_pending');

      // 2. Clear state variables
      setBalance(INITIAL_BALANCE);
      setTrades([]);
      setPositions(INITIAL_POSITIONS);
      setPendingOrders([]);
    }
  };

  const activeStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  return (
    <TradingContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        stocks,
        selectedSymbol,
        setSelectedSymbol,
        activeStock,
        balance,
        trades,
        positions,
        pendingOrders,
        setPendingOrders,
        executeOrderDirectly,
        resetAccount,
        resetState: resetAccount, // Maps both function names to avoid breakage
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export const useTrading = () => useContext(TradingContext);