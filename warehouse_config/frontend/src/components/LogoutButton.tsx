import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 1. Wipe the JWT from local storage
        localStorage.removeItem('access_token');
        
        // 2. Optional: Clear any other session data
        localStorage.clear();

        // 3. Redirect to login screen
        navigate('/login');
    };

    return (
        <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-neon-pink hover:bg-neon-pink/10 border-t border-gray-800 transition-all flex items-center gap-2"
        >
            <span className="opacity-70">⏻</span> Terminate_Session
        </button>
    );
};

export default LogoutButton;