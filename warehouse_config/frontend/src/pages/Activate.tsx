import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Activate = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const activateAccount = async () => {
            try {
                // Djoser activation endpoint
                await axios.post('http://127.0.0.1:8000/user/auth/users/activation/', {
                    uid,
                    token
                });
                alert("ACCOUNT_ACTIVATED: Access granted. Please login.");
                navigate('/login');
            } catch (error) {
                console.error("ACTIVATION_FAILED", error);
                alert("CRITICAL_FAILURE: Activation link invalid or expired.");
            }
        };

        if (uid && token) {
            activateAccount();
        }
    }, [uid, token, navigate]);

    return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-mono text-white">
            <div className="text-neon-cyan animate-pulse">
                [ FINALIZING_OPERATOR_ACTIVATION... ]
            </div>
        </div>
    );
};

export default Activate;