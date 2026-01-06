import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';


// Pages
import Landing from './pages/Landing';
import AllLoginPages from './pages/AllLoginPages';
import IssuerDashboard from './pages/IssuerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyPage from './pages/VerifyPage';
import SharedDocumentPage from './pages/SharedDocumentPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const role = useAuthStore((state) => state.role);

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    // Load auth from localStorage on app start
    loadFromStorage();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login/issuer" element={<AllLoginPages role="issuer" />} />
          <Route path="/login/owner" element={<AllLoginPages role="owner" />} />
          <Route path="/login/admin" element={<AllLoginPages role="admin" />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/shared/:shareToken" element={<SharedDocumentPage />} />

          {/* Protected Routes */}
          <Route
            path="/issuer"
            element={
              <ProtectedRoute requiredRole="issuer">
                <IssuerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;
