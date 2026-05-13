import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

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