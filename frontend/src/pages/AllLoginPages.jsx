import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiBriefcase, FiUser, FiShield, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';

export default function AllLoginPages() {
  const location = useLocation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  // Get role from URL params or use default
  const params = new URLSearchParams(location.search);
  const role = params.get('role') || 'issuer';

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [preFilledEmail, setPreFilledEmail] = useState('');

  // Check if user is coming from successful payment
  useEffect(() => {
    const emailFromLocation = location.state?.email;
    if (emailFromLocation) {
      setPreFilledEmail(emailFromLocation);
      setFormData(prev => ({
        ...prev,
        email: emailFromLocation,
      }));
      toast.success(location.state?.message || 'Payment confirmed! Please log in.');
    }
  }, [location]);

  const roleConfig = {
    issuer: {
      title: 'Issuer Portal',
      subtitle: 'Issue and manage credentials',
      icon: FiBriefcase,
      color: 'red',
      demoEmail: 'issuer@demo.com',
      demoPass: 'Demo@1234',
    },
    owner: {
      title: 'Owner Portal',
      subtitle: 'Manage your documents',
      icon: FiUser,
      color: 'red',
      demoEmail: 'owner@demo.com',
      demoPass: 'Demo@1234',
    },
    admin: {
      title: 'Admin Portal',
      subtitle: 'System administration',
      icon: FiShield,
      color: 'red',
      demoEmail: 'admin@signatura.com',
      demoPass: 'Admin@1234',
    },
  };

  const config = roleConfig[role] || roleConfig.issuer;
  const Icon = config.icon;

  const getColorClasses = () => {
    switch(config.color) {
      case 'red':
        return {
          gradient: 'from-signatura-red to-signatura-accent',
          bg: 'bg-red-100',
          text: 'text-signatura-red',
          button: 'bg-signatura-red hover:bg-signatura-accent',
          buttonText: 'text-signatura-red',
          link: 'text-signatura-red',
          dark: 'bg-red-900',
        };
      default:
        return {
          gradient: 'from-signatura-red to-signatura-accent',
          bg: 'bg-red-100',
          text: 'text-signatura-red',
          button: 'bg-signatura-red hover:bg-signatura-accent',
          buttonText: 'text-signatura-red',
          link: 'text-signatura-red',
          dark: 'bg-red-900',
        };
    }
  };

  const colors = getColorClasses();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (role === 'issuer' && !formData.organizationName?.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // ===== LOGIN FLOW =====
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'signin',
            email: formData.email,
            password: formData.password,
            role: role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
        setRole(role);

        toast.success('Welcome back!');
        navigate(`/${role}`);
      } else {
        // ===== SIGNUP FLOW =====
        // Redirect to payment checkout instead of direct signup
        // Payment checkout page will handle account creation after payment
        navigate('/payment', {
          state: {
            role: role,
            planType: 'professional', // Default to professional plan
            email: formData.email,
            fullName: formData.fullName,
            organizationName: formData.organizationName,
            password: formData.password,
          },
        });
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    // Navigate to payment checkout with form data
    navigate('/payment', {
      state: {
        role: role,
        planType: 'professional',
      },
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-white mb-8 hover:opacity-80 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-block ${colors.bg} p-3 rounded-full mb-4`}>
              <Icon className={`${colors.text} text-3xl`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? `Sign in to ${config.title}` : `Create your ${role} account`}
            </p>
          </div>

          {/* Info banner if coming from payment */}
          {preFilledEmail && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
              <FiAlertCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-medium">Payment successful!</p>
                <p className="text-xs mt-1">Please log in with your credentials</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled={preFilledEmail && isLogin}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${preFilledEmail && isLogin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
            )}

            {!isLogin && role === 'issuer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Your University / Company"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.organizationName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${colors.button} text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-6`}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Sign Up / Sign In Toggle */}
          <p className="text-center text-gray-600 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                if (!isLogin) {
                  // Moving from signup to login
                  setFormData({ 
                    email: formData.email, // Keep email
                    password: '',
                    organizationName: '',
                    fullName: '',
                    confirmPassword: '' 
                  });
                }
              }}
              className={`${colors.link} font-medium hover:underline`}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {/* Direct signup button info (when on signup tab) */}
          {!isLogin && (
            <div className={`mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg`}>
              <p className="text-xs text-blue-700">
                💳 Click "Create Account" to proceed to payment. Choose your plan and complete your purchase.
              </p>
            </div>
          )}
        </div>

        <div className={`mt-8 ${colors.dark} bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white text-sm`}>
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>Email: {config.demoEmail}</p>
          <p>Password: {config.demoPass}</p>
        </div>
      </div>
    </div>
  );
}
