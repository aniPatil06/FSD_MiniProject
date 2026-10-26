import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function AuthModal({ isOpen, onClose, onLogin, required = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Changed from username to name
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    // Payload uses 'name' to match your Mongoose model and authRoutes.js
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      if (!isLogin) {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true); // Switch to sign-in tab
      } else {
        if (!data.token) {
          throw new Error('The login response did not include an authentication token.');
        }

        onLogin(data.token);
        setMessage('Login successful!');
        if (!required) onClose();
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xs">PT</div>
              <span className="font-bold text-base text-white tracking-wide">PulseTrade Access</span>
            </div>
            {!required && (
              <button onClick={onClose} className="text-slate-400 hover:text-white text-lg transition-colors cursor-pointer">
                ✕
              </button>
            )}
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { setIsLogin(true); setMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-xs font-semibold ${message.includes('successful') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {message}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trader Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aniruddha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="trader@pulsetrade.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-lg shadow-blue-600/20 mt-2"
          >
            {isLogin ? 'Authenticate Terminal' : 'Register Trader Account'}
          </button>
        </form>

        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Encrypted connection via 256-bit SSL node verification.
          </p>
        </div>
      </div>
    </div>
  );
}