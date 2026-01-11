import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { supabase } from './utils/supabase';
import './styles/Landing.css';
import PaymentPage from './pages/PaymentPage';

// Pages
import Landing from './pages/Landing';
import AllLoginPages from './pages/AllLoginPages';
import IssuerDashboard from './pages/IssuerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerProfile from './pages/OwnerProfile';
import NotificationCenter from './pages/NotificationCenter';
import AdminDashboard from './pages/AdminDashboard';
import SharedDocumentPage from './pages/SharedDocumentPage';
import UserProfile from './pages/UserProfile';

// NotFound component
const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Go Home
      </a>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login/${requiredRole || 'issuer'}`} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);

          // Fetch user profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setRole(userData.role);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);

          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setRole(userData.role);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [setUser, setRole, setIsLoading]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Login Routes - all handled by AllLoginPages */}
        <Route path="/login/:role" element={<AllLoginPages />} />

        {/* Shared Document Route - PUBLIC (no authentication needed) */}
        <Route path="/shared/:token" element={<SharedDocumentPage />} />

        {/* Protected Routes - Issuer */}
        <Route
          path="/issuer/*"
          element={
            <ProtectedRoute requiredRole="issuer">
              <IssuerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===== Protected Routes - OWNER ===== */}
        {/* Main Owner Dashboard */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Owner Profile Page */}
        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerProfile />
            </ProtectedRoute>
          }
        />

        {/* Owner Notifications Page */}
        <Route
          path="/owner/notifications"
          element={
            <ProtectedRoute requiredRole="owner">
              <NotificationCenter />
            </ProtectedRoute>
          }
        />

        {/* Owner Dashboard with wildcard for sub-routes */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Payment Route */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* User Profile Route */}
        <Route path="/profile" element={<UserProfile />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
