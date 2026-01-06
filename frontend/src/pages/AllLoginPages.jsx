import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  FiMail, FiLock, FiBriefcase, FiUser, FiShield, FiEye, FiEyeOff, 
  FiArrowLeft, FiAlertCircle 
} from 'react-icons/fi';

export default function AllLoginPages() {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  // State
  const [selectedRole, setSelectedRole] = useState(urlRole || 'issuer');
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

  // Role configurations
  const roleConfig = {
    issuer: {
      title: '🏢 Issuer Portal',
      subtitle: 'Issue and manage digital credentials',
      icon: FiBriefcase,
      color: 'red',
      demoEmail: 'issuer@demo.com',
      demoPass: 'Demo@1234',
      features: ['Issue Credentials', 'Manage Requests', 'View Statistics'],
    },
    owner: {
      title: '👤 Owner Wallet',
      subtitle: 'Store and share your credentials',
      icon: FiUser,
      color: 'blue',
      demoEmail: 'owner@demo.com',
      demoPass: 'Demo@1234',
      features: ['Digital Wallet', 'Verify Credentials', 'Control Sharing'],
    },
    admin: {
      title: '🛡️ Admin Portal',
      subtitle: 'System administration',
      icon: FiShield,
      color: 'purple',
      demoEmail: 'admin@signatura.com',
      demoPass: 'Admin@1234',
      features: ['User Management', 'Analytics', 'System Settings'],
    },
  };

  const config = roleConfig[selectedRole] || roleConfig.issuer;
  const Icon = config.icon;

  const getColorClasses = () => {
    switch (config.color) {
      case 'blue':
        return {
          gradient: 'from-blue-600 to-blue-400',
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          tab: 'text-blue-600 border-blue-600',
          dark: 'bg-blue-900',
        };
      case 'purple':
        return {
          gradient: 'from-purple-600 to-purple-400',
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          tab: 'text-purple-600 border-purple-600',
          dark: 'bg-purple-900',
        };
      default: // red
        return {
          gradient: 'from-red-600 to-red-400',
          bg: 'bg-red-100',
          text: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          tab: 'text-red-600 border-red-600',
          dark: 'bg-red-900',
        };
    }
  };

  const colors = getColorClasses();

  // Check for payment success
  useEffect(() => {
    const emailFromLocation = new URLSearchParams(window.location.search).get('email');
    if (emailFromLocation) {
      setPreFilledEmail(emailFromLocation);
      setFormData(prev => ({ ...prev, email: emailFromLocation }));
      toast.success('Payment confirmed! Please log in.');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (selectedRole === 'issuer' && !formData.organizationName?.trim()) {
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIsLogin(true);
    setFormData({
      email: preFilledEmail || '',
      password: '',
      organizationName: '',
      fullName: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'signin',
            email: formData.email,
            password: formData.password,
            role: selectedRole,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
        setRole(selectedRole);
        toast.success(`Welcome back, ${selectedRole}!`);
        navigate(`/${selectedRole}`);
      } else {
        // SIGNUP - Redirect to Payment
        navigate('/payment', {
          state: {
            role: selectedRole,
            planType: 'professional',
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

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-white mb-8 hover:opacity-80 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back to Home
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white text-center`}>
            <div className={`inline-block ${colors.bg} p-3 rounded-full mb-3`}>
              <Icon className={`${colors.text} text-3xl`} />
            </div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-white text-sm opacity-90 mt-1">{config.subtitle}</p>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-gray-200">
            {Object.entries(roleConfig).map(([role, cfg]) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition ${
                  selectedRole === role
                    ? `${colors.tab} border-b-2`
                    : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900'
                }`}
              >
                {role === 'issuer' && '🏢 Issuer'}
                {role === 'owner' && '👤 Owner'}
                {role === 'admin' && '🛡️ Admin'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Payment Success Banner */}
            {preFilledEmail && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                <FiAlertCircle className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">✓ Payment successful!</p>
                  <p className="text-xs mt-1">Log in with your credentials</p>
                </div>
              </div>
            )}

            {/* Form Title */}
            <p className="text-center text-gray-600 text-sm mb-6">
              {isLogin ? `Sign in to ${config.title}` : `Create your ${selectedRole} account`}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
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
                    } ${preFilledEmail && isLogin ? 'bg-gray-50' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Full Name (Signup) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              {/* Organization Name (Issuer Signup) */}
              {!isLogin && selectedRole === 'issuer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Your University / Company"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                      errors.organizationName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.organizationName && (
                    <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
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

              {/* Confirm Password (Signup) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${colors.button} text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-6`}
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Continue to Payment'}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <p className="text-center text-gray-600 mt-6 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className={`${colors.text} font-medium hover:underline`}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            {/* Signup Info */}
            {!isLogin && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  💳 Click "Continue to Payment" to proceed with account creation. Choose your plan and complete payment.
                </p>
              </div>
            )}
          </div>

          {/* Demo Credentials */}
          <div className={`${colors.dark} bg-opacity-50 backdrop-blur-sm rounded-lg p-4 m-4 text-white text-sm`}>
            <p className="font-medium mb-2">📝 Demo Credentials:</p>
            <p className="text-xs">Email: <code>{config.demoEmail}</code></p>
            <p className="text-xs">Password: <code>{config.demoPass}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
