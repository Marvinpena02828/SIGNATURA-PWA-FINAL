// api/auth.js - WORKING authentication with correct Supabase methods

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const jwtSecret = process.env.JWT_SECRET || 'signatura-secret-2024-change-in-production';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, email, password, fullName, organizationName, role, planType } = req.body;

    console.log('🔐 Auth Request:', { action, email, role });

    // Validate inputs
    if (!action || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, email, password',
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // ============================================
    // SIGNUP
    // ============================================
    if (action === 'signup') {
      console.log('📝 Processing SIGNUP for:', email);

      if (!fullName || fullName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Full name is required',
        });
      }

      try {
        // ✅ Use correct Supabase method: signUp
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: fullName,
            organization_name: organizationName || null,
            role: role || 'issuer',
            plan_type: planType || 'professional',
          },
        });

        if (authError) {
          console.error('❌ Auth creation error:', authError.message);
          return res.status(400).json({
            success: false,
            error: authError.message || 'Failed to create account',
          });
        }

        console.log('✅ Auth user created:', authData.user.id);

        // Generate JWT
        const token = jwt.sign(
          {
            sub: authData.user.id,
            email: authData.user.email,
            role: role || 'issuer',
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        // Return user object
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          fullName,
          organizationName: organizationName || null,
          role: role || 'issuer',
          planType: planType || 'professional',
        };

        console.log('✅ Signup successful');

        return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          user,
          token,
        });
      } catch (error) {
        console.error('❌ Signup error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Signup failed',
        });
      }
    }

    // ============================================
    // SIGNIN
    // ============================================
    if (action === 'signin') {
      console.log('🔑 Processing SIGNIN for:', email);

      try {
        // ✅ Use correct Supabase method: signInWithPassword
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('❌ Sign in error:', signInError.message);
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        if (!sessionData?.user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        // Get user metadata
        const metadata = sessionData.user.user_metadata || {};

        // Generate JWT
        const token = jwt.sign(
          {
            sub: sessionData.user.id,
            email: sessionData.user.email,
            role: metadata.role || 'issuer',
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        // Return user object
        const user = {
          id: sessionData.user.id,
          email: sessionData.user.email,
          fullName: metadata.full_name || email.split('@')[0],
          organizationName: metadata.organization_name || null,
          role: metadata.role || role || 'issuer',
          planType: metadata.plan_type || 'professional',
        };

        console.log('✅ Signin successful');

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user,
          token,
        });
      } catch (error) {
        console.error('❌ Signin error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Login failed',
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use "signin" or "signup"',
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
