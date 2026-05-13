import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [re_password, setRePassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== re_password) {
            alert("SECURITY_ERROR: Passwords do not match");
            return;
        }

        try {
            // Djoser registration endpoint
            await axios.post('http://127.0.0.1:8000/user/auth/users/', {
                username,
                email,
                password,
                re_password,
            });

            alert("REGISTRATION_SUCCESS: Operator credentials indexed.");
            navigate('/login');
        } catch (error: any) {
            console.error("REGISTRATION_FAILED", error.response?.data);
            alert("ACCESS_DENIED: Check credentials or email format");
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-mono text-white">
            <div className="border border-neon-cyan/30 p-10 bg-black/40 backdrop-blur-md w-96 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <h2 className="text-neon-cyan text-xs mb-8 uppercase tracking-[0.3em] font-bold italic text-center">
                    [ NEW_OPERATOR_ENROLLMENT ]
                </h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="ASSIGN_USERNAME"
                        className="w-full bg-black border border-gray-800 p-3 text-[11px] focus:border-neon-cyan outline-none transition-all"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input 
                        type="email" 
                        placeholder="ASSIGN_EMAIL"
                        className="w-full bg-black border border-gray-800 p-3 text-[11px] focus:border-neon-cyan outline-none transition-all"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="SET_ACCESS_KEY"
                        className="w-full bg-black border border-gray-800 p-3 text-[11px] focus:border-neon-cyan outline-none transition-all"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="CONFIRM_ACCESS_KEY"
                        className="w-full bg-black border border-gray-800 p-3 text-[11px] focus:border-neon-cyan outline-none transition-all"
                        onChange={(e) => setRePassword(e.target.value)}
                        required
                    />
                    <button className="w-full bg-neon-cyan text-black font-black py-2 text-[11px] hover:bg-white transition-all uppercase">
                        Authorize_Enrollment
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <Link to="/login" className="text-[9px] text-gray-500 hover:text-neon-cyan uppercase tracking-widest">
                        Return_to_Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;