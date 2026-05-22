import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const Profile = () => {
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      try {
        // Updated to use your local IP and the Djoser 'me' endpoint
        const response = await axios.get('http://127.0.0.1:8000/user/auth/users/me/', {
          headers: {
            // Djoser default uses 'Token', standard JWT uses 'Bearer'
            Authorization: `Bearer ${token}`
          }
        });
        setAccount(response.data);
      } catch (error) {
        console.error("Session Expired or Unauthorized", error);
      }
    };
    fetchProfile();
  }, []);

  if (!account) return <div className="p-20 text-cyan-500 font-mono italic animate-pulse">DECRYPTING_OPERATOR_DATA...</div>;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const response = await axios.patch('http://127.0.0.1:8000/user/auth/users/me/', formData, {
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
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path}`;
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