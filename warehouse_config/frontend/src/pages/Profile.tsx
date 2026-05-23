import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../api';

const Profile = () => {
  const [account, setAccount] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setErrorMsg("AUTHENTICATION_REQUIRED: No secure access key index found in local terminal storage. Redirecting...");
        setTimeout(() => navigate('/login'), 2500);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}user/auth/users/me/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Validate that we received user object rather than HTML string or other invalid data
        if (typeof response.data !== 'object' || response.data === null || !('email' in response.data)) {
          throw new Error("Invalid server payload structure. Backend returned non-JSON data.");
        }
        setAccount(response.data);
      } catch (error: any) {
        console.error("Session Expired or Unauthorized", error);
        const detail = error.response?.data?.detail || error.message || "Unknown error";
        setErrorMsg(`API_UPLINK_FAILURE: Failed to fetch profile from [${API_BASE_URL}user/auth/users/me/]. Details: ${detail}`);
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          setTimeout(() => navigate('/login'), 3000);
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  if (errorMsg) {
    return (
      <Layout title="Operator_Profile">
        <div className="max-w-2xl mx-auto border border-neon-pink/40 bg-black/40 p-8 backdrop-blur-sm font-mono mt-10 shadow-[0_0_20px_rgba(255,0,85,0.1)] text-neon-pink">
          <h2 className="text-xs mb-4 uppercase tracking-[0.2em] font-bold">[ SECURE_UPLINK_ERROR ]</h2>
          <p className="text-[11px] leading-relaxed mb-4">{errorMsg}</p>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest animate-pulse">
            ATTEMPTING_SYSTEM_RECOVERY...
          </div>
        </div>
      </Layout>
    );
  }

  if (!account) return <div className="p-20 text-cyan-500 font-mono italic animate-pulse">DECRYPTING_OPERATOR_DATA...</div>;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const response = await axios.patch(`${API_BASE_URL}user/auth/users/me/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setAccount(response.data);
      alert("AVATAR_UPLOAD_SUCCESS: Profile database updated.");
    } catch (error) {
      console.error("Upload error", error);
      alert("AVATAR_UPLOAD_FAILED: Check file format.");
    }
  };

  const getAvatarUrl = (path: string) => {
    if (!path) return null;
    
    let url = path;
    if (!url.startsWith('http')) {
      const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      url = `${base}${cleanPath}`;
    }
    
    // If the frontend is loaded over HTTPS, upgrade backend URL scheme to HTTPS to bypass mixed content blocks
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      url = url.replace(/^http:/i, 'https:');
    }
    return url;
  };

  const displayValue = (val: any, fallback: string) => (val && val !== "" ? val : fallback);

  const getDesignation = () => {
    if (account.is_admin) return "Administrator";
    if (account.is_staff) return "Warehouse Staff";
    return "Standard Operator";
  };

  const getAccessLevel = () => {
    if (account.is_admin) return "ROOT_OPERATOR";
    if (account.is_staff) return "STAFF_OPERATOR";
    return "BASIC_OPERATOR";
  };

  return (
    <Layout title="Operator_Profile">
      <div className="max-w-2xl mx-auto border border-gray-800 bg-black/20 p-8 backdrop-blur-sm font-mono mt-10 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        
        {/* Avatar & Profile Top Section */}
        <div className="flex flex-col items-center pb-8 border-b border-gray-800 mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center mb-4">
            {account.profile_picture ? (
              <img 
                src={getAvatarUrl(account.profile_picture) || ''} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-cyan-400 font-bold text-3xl">[ OP ]</div>
            )}
          </div>
          
          <label className="cursor-pointer text-[10px] text-cyan-400 border border-cyan-500/40 px-3 py-1.5 hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-widest font-bold">
            [ UPLOAD_AVATAR_FILE ]
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
            />
          </label>
        </div>

        <div className="border-b border-gray-800 pb-4 mb-6">
          <h2 className="text-cyan-400 font-black text-xs uppercase tracking-widest">[ OPERATOR_AUDIT_LOG ]</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 text-[11px] uppercase tracking-tighter">
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">OPERATOR_NAME</p>
            <p className="text-white font-bold">
              {account.first_name || account.last_name 
                ? `${account.first_name} ${account.last_name}`.trim() 
                : 'NOT_SET'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">EMAIL_ADDRESS</p>
            <p className="text-white font-bold">{account.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">ROLE_DESIGNATION</p>
            <p className="text-cyan-400 font-bold">{getDesignation()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">ACCESS_LEVEL_CODE</p>
            <p className="text-cyan-400 font-bold tracking-widest">{getAccessLevel()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">CURRENT_AGE</p>
            <p className="text-white font-bold">{displayValue(account.age, 'NOT_SET')}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">DATE_OF_BIRTH</p>
            <p className="text-white font-bold">{displayValue(account.birthday, 'NOT_SET')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 text-[9px] mb-1 tracking-[0.2em]">PHYSICAL_ADDRESS</p>
            <p className="text-white font-bold leading-relaxed">{displayValue(account.address, 'NO_ADDRESS_LOGGED')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;