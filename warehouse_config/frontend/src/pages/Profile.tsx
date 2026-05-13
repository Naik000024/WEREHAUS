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

  const displayValue = (val: any, fallback: string) => (val && val !== "" ? val : fallback);

  return (
    <Layout title="Operator_Profile">
      <div className="max-w-2xl mx-auto border border-gray-800 bg-black/20 p-8 backdrop-blur-sm font-mono mt-10">
        <div className="border-b border-gray-800 pb-4 mb-6">
          <h2 className="text-cyan-400 font-black text-sm uppercase tracking-widest">[ ACCOUNT_DETAILS ]</h2>
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