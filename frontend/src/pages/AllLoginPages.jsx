import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiBriefcase, FiUser, FiShield, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

export default function AllLoginPages() {
  const { role = 'issuer' } = useParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

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

  const roleConfig = {
    issuer: {
      title: 'Issuer Portal',
      subtitle: 'Issue and manage credentials',
      icon: FiBriefcase,
      color: 'blue',
      demoEmail: 'issuer@demo.com',
      demoPass: 'Demo@1234',
    },
    owner: {
      title: 'Owner Portal',
      subtitle: 'Manage your documents',
      icon: FiUser,
      color: 'green',
      demoEmail: 'owner@demo.com',
      demoPass: 'Demo@1234',
    },
    admin: {
      title: 'Admin Portal',
      subtitle: 'System administration',
      icon: FiShield,
      color: 'purple',
      demoEmail: 'admin@signatura.com',
      demoPass: 'Admin@1234',
    },
  };

  const config = roleConfig[role] || roleConfig.issuer;
  const Icon = config.icon;

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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userData?.role !== role) {
          throw new Error(`This account is not a ${role} account`);
        }

        setUser(userData);
        setRole(role);

        toast.success('Welcome back!');
        navigate(`/${role}`);
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        const { data: userData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            role: role,
            organization_name: formData.organizationName || null,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        setUser(userData);
        setRole(role);

        toast.success('Account created! Welcome to Signatura.');
        navigate(`/${role}`);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.color === 'blue' ? 'from-blue-600 to-blue-800' : config.color === 'green' ? 'from-green-600 to-green-800' : 'from-purple-600 to-purple-800'} flex items-center justify-center px-4 py-12`}>
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
            <div className={`inline-block ${config.color === 'blue' ? 'bg-blue-100' : config.color === 'green' ? 'bg-green-100' : 'bg-purple-100'} p-3 rounded-full mb-4`}>
              <Icon className={`${config.color === 'blue' ? 'text-blue-600' : config.color === 'green' ? 'text-green-600' : 'text-purple-600'} text-3xl`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600 mt-2">
              {isLogin ? `Sign in to ${config.title}` : `Create your ${role} account`}
            </p>
          </div>

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
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
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
              className={`w-full ${config.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : config.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-6`}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({ email: '', password: '', organizationName: '', fullName: '', confirmPassword: '' });
              }}
              className={`${config.color === 'blue' ? 'text-blue-600' : config.color === 'green' ? 'text-green-600' : 'text-purple-600'} font-medium hover:underline`}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className={`mt-8 ${config.color === 'blue' ? 'bg-blue-900' : config.color === 'green' ? 'bg-green-900' : 'bg-purple-900'} bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white text-sm`}>
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>Email: {config.demoEmail}</p>
          <p>Password: {config.demoPass}</p>
        </div>
      </div>
    </div>
  );
}
