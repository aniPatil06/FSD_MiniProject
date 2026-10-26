import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

export default function Chat() {
  const socketRef = useRef(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    
    socket.on('chatMessage', (data) => {
      setMessages((previous) => [...previous, data]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!username.trim() || !message.trim() || !connected || !socketRef.current) {
      return;
    }

    const socketMessage = {
      username: username.trim(),
      message: message.trim()
    };

    socketRef.current.emit('chatMessage', socketMessage);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h1 className="text-xl font-bold text-white tracking-wide">
            PulseTrade Live Terminal Chat
          </h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${connected ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {connected ? '● Connected' : '○ Connecting...'}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Trader Handle</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your name"
            maxLength={50}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-4 mb-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-20">
              No messages broadcasted yet. Start the stream!
            </p>
          ) : (
            messages.map((item, index) => (
              <div key={`${index}-${item.username}`} className="bg-slate-900 border border-slate-800/60 rounded-lg p-2.5 shadow-sm">
                <p className="text-xs text-slate-300 break-words">
                  <strong className="text-blue-400 font-semibold">{item.username}:</strong> {item.message}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!connected || !username.trim() || !message.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
          >
            Broadcast
          </button>
        </form>
      </div>
    </div>
  );
}