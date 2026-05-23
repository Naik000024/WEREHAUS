import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MasterDashboard from './pages/MasterDashboard';
import Inventory from './pages/Inventory';
import LogsArchive from './pages/LogsArchive';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Activate from './pages/Activate'; // Import the activation component

// Simple check to see if the operator is authenticated
const isAuthenticated = () => !!localStorage.getItem('access_token');

const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
  return isAuthenticated() ? element : <Navigate to="/login" replace />;
};

const PublicRoute = ({ element }: { element: React.ReactElement }) => {
  return !isAuthenticated() ? element : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 1. INITIAL ENTRY */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* 2. AUTHENTICATION ROUTES */}
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />
        
        {/* 3. ACCOUNT ACTIVATION ROUTE */}
        <Route path="/activate/:uid/:token" element={<Activate />} />

        {/* 4. MAIN APPLICATION ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute element={<MasterDashboard />} />} />
        <Route path="/inventory" element={<ProtectedRoute element={<Inventory />} />} />
        <Route path="/logs" element={<ProtectedRoute element={<LogsArchive />} />} />
        
        {/* 5. OPERATOR PROFILE ROUTE */}
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

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