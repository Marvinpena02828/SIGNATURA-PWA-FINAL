// api/auth.js - Authentication endpoints

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const jwtSecret = process.env.JWT_SECRET;

// POST /api/auth - signin or signup
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, role, organizationName, fullName } = req.body;

  try {
    if (action === 'signin') {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userData?.role !== role) {
        throw new Error(`This account is not a ${role} account`);
      }

      // Create JWT token
      const token = jwt.sign(
        { id: data.user.id, email: data.user.email, role: userData.role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        user: userData,
        token,
        message: 'Signed in successfully',
      });
    } else if (action === 'signup') {
      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user profile
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          role,
          organization_name: organizationName || null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create JWT token
      const token = jwt.sign(
        { id: authData.user.id, email, role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        user: userData,
        token,
        message: 'Account created successfully',
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
}
