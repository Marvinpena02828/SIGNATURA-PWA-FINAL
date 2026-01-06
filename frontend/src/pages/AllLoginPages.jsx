import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { 
  FiMail, FiLock, FiBriefcase, FiUser, FiShield, FiEye, FiEyeOff, 
  FiArrowLeft, FiAlertCircle 
} from 'react-icons/fi';
import logo from '../assets/logo31.png';

export default function AllLoginPages() {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();
  
  // ✅ PROPER way to use authStore
  const { login, signup } = useAuthStore();

  // Local state
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
    },
    owner: {
      title: '👤 Owner Wallet',
      subtitle: 'Store and share your credentials',
      icon: FiUser,
      color: 'blue',
      demoEmail: 'owner@demo.com',
      demoPass: 'Demo@1234',
    },
    admin: {
      title: '🛡️ Admin Portal',
      subtitle: 'System administration',
      icon: FiShield,
      color: 'purple',
      demoEmail: 'admin@signatura.com',
      demoPass: 'Admin@1234',
    },
  };

  const config = roleConfig[selectedRole] || roleConfig.issuer;
  const Icon = config.icon;

  const getColorClasses = () => {
    switch (config.color) {
      case 'blue':
        return {
          gradient: 'from-blue-600 to-blue-400',
          gradientBg: 'bg-gradient-to-br from-blue-600 to-blue-400',
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          tab: 'text-blue-600 border-blue-600',
          dark: 'bg-blue-900',
          border: 'border-blue-200',
          lightBg: 'bg-blue-50',
        };
      case 'purple':
        return {
          gradient: 'from-purple-600 to-purple-400',
          gradientBg: 'bg-gradient-to-br from-purple-600 to-purple-400',
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          tab: 'text-purple-600 border-purple-600',
          dark: 'bg-purple-900',
          border: 'border-purple-200',
          lightBg: 'bg-purple-50',
        };
      default: // red
        return {
          gradient: 'from-red-600 to-red-400',
          gradientBg: 'bg-gradient-to-br from-red-600 to-red-400',
          bg: 'bg-red-100',
          text: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          tab: 'text-red-600 border-red-600',
          dark: 'bg-red-900',
          border: 'border-red-200',
          lightBg: 'bg-red-50',
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
        // ✅ LOGIN
        console.log('🔑 Attempting login...');
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
        console.log('✅ Login response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // ✅ USE AUTHSTORE PROPERLY
        login(data.user, selectedRole, data.token);
        
        toast.success(`Welcome back, ${selectedRole}!`);
        navigate(`/${selectedRole}`);
      } else {
        // ✅ SIGNUP - Redirect to Payment
        console.log('📝 Redirecting to payment...');
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
      console.error('❌ Error:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${colors.gradientBg} flex flex-col items-center justify-center px-4 py-12`}>
      {/* Logo at Top with White Background */}
      <div className="mb-8 bg-white rounded-full p-4 shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center hover:opacity-80 transition transform hover:scale-105"
        >
          <img 
            src={logo} 
            alt="Signatura Logo" 
            height="60" 
            className="drop-shadow-md"
          />
        </button>
      </div>

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
          <div className={`bg-gradient-to-r ${colors.gradient} p-8 text-white text-center`}>
            <div className={`inline-block ${colors.bg} p-4 rounded-full mb-4`}>
              <Icon className={`${colors.text} text-4xl`} />
            </div>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            <p className="text-white text-sm opacity-90 mt-2">{config.subtitle}</p>
          </div>

          {/* Role Tabs */}
          <div className="flex border-b border-gray-200">
            {Object.entries(roleConfig).map(([role, cfg]) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-4 px-4 text-sm font-medium transition ${
                  selectedRole === role
                    ? `${colors.tab} border-b-2 font-bold`
                    : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900'
                }`}
              >
                {role === 'issuer' && '🏢'}
                {role === 'owner' && '👤'}
                {role === 'admin' && '🛡️'}
                <span className="ml-2 hidden sm:inline">
                  {role === 'issuer' && 'Issuer'}
                  {role === 'owner' && 'Owner'}
                  {role === 'admin' && 'Admin'}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Payment Success Banner */}
            {preFilledEmail && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                <div className="text-green-600 flex-shrink-0 mt-0.5">
                  <FiAlertCircle size={20} />
                </div>
                <div className="text-sm text-green-700">
                  <p className="font-semibold">✓ Payment successful!</p>
                  <p className="text-xs mt-1">Log in with your credentials</p>
                </div>
              </div>
            )}

            {/* Form Title */}
            <p className="text-center text-gray-600 text-sm mb-6 font-medium">
              {isLogin ? `Sign in to your ${selectedRole} account` : `Create your ${selectedRole} account`}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    disabled={preFilledEmail && isLogin}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : `border-gray-300 focus:ring-red-500`
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Full Name (Signup) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              {/* Organization Name (Issuer Signup) */}
              {!isLogin && selectedRole === 'issuer' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Your University / Company"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.organizationName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                    }`}
                  />
                  {errors.organizationName && (
                    <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password (Signup) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                        errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${colors.button} text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-8`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </span>
                ) : isLogin ? 'Sign In' : 'Continue to Payment'}
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
                className={`${colors.text} font-semibold hover:underline`}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>

            {/* Signup Info */}
            {!isLogin && (
              <div className={`mt-5 p-4 ${colors.lightBg} border ${colors.border} rounded-lg`}>
                <p className="text-xs text-gray-700">
                  💳 Click <span className="font-semibold">"Continue to Payment"</span> to proceed
                </p>
              </div>
            )}
          </div>

          {/* Demo Credentials */}
          <div className={`${colors.dark} bg-opacity-60 p-5 m-4 text-white text-sm rounded-lg border-l-4`}>
            <p className="font-bold mb-2">📝 Demo Account</p>
            <p className="text-xs">Email: <code>{config.demoEmail}</code></p>
            <p className="text-xs">Pass: <code>{config.demoPass}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
