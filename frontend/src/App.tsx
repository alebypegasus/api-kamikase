import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import PDV from './pages/PDV';
import SystemDashboard from './pages/SystemDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, requireAdmin, forbidAdmin }: { children: React.ReactNode, requireAdmin?: boolean, forbidAdmin?: boolean }) => {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/pdv" />;
  if (forbidAdmin && isAdmin) return <Navigate to="/adm" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/pdv" element={<ProtectedRoute forbidAdmin={true}><PDV /></ProtectedRoute>} />
          <Route path="/system" element={<ProtectedRoute forbidAdmin={true}><SystemDashboard /></ProtectedRoute>} />
          <Route path="/adm" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
