import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MasterDashboard from './pages/MasterDashboard';
import Inventory from './pages/Inventory';
import LogsArchive from './pages/LogsArchive';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Activate from './pages/Activate'; // Import the activation component

// Simple check to see if the operator is authenticated
const isAuthenticated = () => !!localStorage.getItem('access_token');

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 1. INITIAL ENTRY: Redirect to Login if not authenticated, otherwise Dashboard */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
        
        {/* 2. AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 3. ACCOUNT ACTIVATION ROUTE */}
        {/* This catches the link sent to your email by Djoser */}
        <Route path="/activate/:uid/:token" element={<Activate />} />

        {/* 4. MAIN APPLICATION ROUTES */}
        <Route path="/dashboard" element={<MasterDashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/logs" element={<LogsArchive />} />
        
        {/* 5. OPERATOR PROFILE ROUTE */}
        <Route path="/profile" element={<Profile />} />

        {/* 404 Catch-all */}
        <Route path="*" element={
          <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-mono text-neon-pink text-sm">
            [ ERROR: 404_CORE_NOT_FOUND ]
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;