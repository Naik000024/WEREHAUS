import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: "🤖 [WEREHAUS_INTELLIGENCE_ONLINE]\nGreetings! I am your automated inventory assistant. Type `help` to list supported system diagnostics." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}api/chatbot/`, {
        message: userText
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'bot', text: "🤖 [CONNECTION_FAIL] Could not establish secure uplink to intelligence core." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-mono">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-white text-black flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 outline-none"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 h-[400px] border border-cyan-500/40 bg-black/90 backdrop-blur-md rounded shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[11px]">
          {/* Header */}
          <div className="border-b border-gray-800 p-3 bg-cyan-950/20 flex justify-between items-center">
            <span className="text-cyan-400 font-bold uppercase tracking-widest">[ WEREHAUS_CO_PILOT ]</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded p-2.5 whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-cyan-500 text-black font-semibold' 
                      : 'bg-gray-900 border border-gray-800 text-cyan-400/90'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-900 border border-gray-800 text-cyan-400/60 rounded p-2 animate-pulse">
                  [ ANALYZING_QUERY... ]
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Entry Form */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-2 bg-black flex gap-2">
            <input 
              type="text" 
              placeholder="ENTER_PROMPT..."
              className="flex-1 bg-black text-cyan-400 border border-gray-800 focus:border-cyan-500 outline-none p-2 rounded tracking-tighter"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-cyan-500 text-black px-4 py-2 rounded font-black hover:bg-white uppercase text-[10px] tracking-wider transition-all"
            >
              SEND
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans selection:bg-neon-cyan selection:text-black">
      <nav className="border-b border-gray-800 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-neon-cyan rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.4)]">
              <span className="text-black font-black -rotate-45 text-xs">W</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
              {title}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
            <Link 
              to="/dashboard" 
              className={`pb-1 transition-all ${location.pathname === '/dashboard' ? 'text-neon-cyan border-b border-neon-cyan' : 'text-gray-500 hover:text-white'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/inventory" 
              className={`pb-1 transition-all ${location.pathname === '/inventory' ? 'text-neon-cyan border-b border-neon-cyan' : 'text-gray-500 hover:text-white'}`}
            >
              Inventory
            </Link>
            <Link 
              to="/logs" 
              className={`pb-1 transition-all ${location.pathname === '/logs' ? 'text-neon-cyan border-b border-neon-cyan' : 'text-gray-500 hover:text-white'}`}
            >
              Logs_Archive
            </Link>
            <Link 
              to="/profile" 
              className={`pb-1 transition-all ${location.pathname === '/profile' ? 'text-neon-cyan border-b border-neon-cyan' : 'text-gray-500 hover:text-white'}`}
            >
              Profile
            </Link>

            {/* LOGOUT BUTTON */}
            <button 
              onClick={handleLogout}
              className="ml-4 px-3 py-1 border border-neon-pink/50 text-neon-pink hover:bg-neon-pink hover:text-black transition-all duration-300 italic"
            >
              Terminate_Session
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>

      {/* Futuristic Floating Chatbot widget */}
      <ChatbotWidget />

      <footer className="border-t border-gray-800 py-6 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] text-gray-600 font-mono">
          <span>Terminal_v3.0.1_Stable</span>
          <span>© 2026 Warehouse_Systems_Group</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;