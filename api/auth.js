// api/auth.js - Authentication endpoints with Supabase

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST /api/auth - signin or signup
export default async function handler(req, res) {
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

    // ============================================
    // VALIDATE INPUTS
    // ============================================
    if (!action || !email || !password) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, email, password',
      });
    }

    // ✅ FIXED: Better email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format. Please use a valid email address.',
      });
    }

    // ✅ FIXED: Allow passwords 6+ characters (lowercase, numbers, special chars all OK)
    if (!password || password.length < 6) {
      console.error('❌ Password too short');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // ============================================
    // SIGNUP
    // ============================================
    if (action === 'signup') {
      console.log('📝 Processing signup for:', email);

      if (!fullName || fullName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Full name is required',
        });
      }

      if (role === 'issuer' && !organizationName) {
        return res.status(400).json({
          success: false,
          error: 'Organization name is required for issuers',
        });
      }

      try {
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (!checkError && existingUser) {
          return res.status(409).json({
            success: false,
            error: 'Email already registered. Please log in instead.',
          });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email
        });

        if (authError) {
          console.error('❌ Auth creation error:', authError);
          return res.status(400).json({
            success: false,
            error: authError.message || 'Failed to create account',
          });
        }

        // Create user profile in database
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            organization_name: organizationName || null,
            role,
            plan_type: planType || 'professional',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Profile creation error:', insertError);
          return res.status(400).json({
            success: false,
            error: 'Failed to create user profile',
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            sub: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        console.log('✅ User signup successful:', newUser.id);

        return res.status(201).json({
          success: true,
          message: 'Account created successfully',
          user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.full_name,
            organizationName: newUser.organization_name,
            role: newUser.role,
            planType: newUser.plan_type,
          },
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
    // SIGNIN (LOGIN)
    // ============================================
    if (action === 'signin') {
      console.log('🔑 Processing signin for:', email);

      try {
        // Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(
          email
        );

        if (authError || !authData?.user) {
          console.error('❌ User not found:', email);
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        // Verify password (in production, use secure comparison)
        // For now, rely on Supabase auth session
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !sessionData?.session) {
          console.error('❌ Auth failed:', signInError);
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError || !userProfile) {
          console.error('❌ Profile not found:', authData.user.id);
          return res.status(404).json({
            success: false,
            error: 'User profile not found',
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            sub: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
          },
          jwtSecret,
          { expiresIn: '7d' }
        );

        console.log('✅ User signin successful:', userProfile.id);

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: {
            id: userProfile.id,
            email: userProfile.email,
            fullName: userProfile.full_name,
            organizationName: userProfile.organization_name,
            role: userProfile.role,
            planType: userProfile.plan_type,
          },
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

    // Invalid action
    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use "signin" or "signup"',
    });

  } catch (error) {
    console.error('❌ Auth handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
