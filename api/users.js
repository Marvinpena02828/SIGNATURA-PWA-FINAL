// api/users.js - User management endpoints
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const jwtSecret = process.env.JWT_SECRET;

function corsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export default async function handler(req, res) {
  corsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get user profile
      const user = verifyToken(req);
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Users can only view their own profile unless they're admin
      if (user.id !== userId && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'User not found' });
        }
        throw error;
      }

      return res.status(200).json({ success: true, data });
    } else if (req.method === 'PUT') {
      // Update user profile
      const user = verifyToken(req);
      const { userId, ...updateData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Users can only update their own profile unless they're admin
      if (user.id !== userId && user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Prevent users from changing their own role (only admin can do this)
      if (updateData.role && user.role !== 'admin') {
        delete updateData.role;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'User not found' });
        }
        throw error;
      }

      return res.status(200).json({ success: true, data });
    } else if (req.method === 'POST') {
      // Get all users (admin only)
      const user = verifyToken(req);

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized - admin access required' });
      }

      const { data, error } = await supabase.from('users').select('*');

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const statusCode = error.message.includes('Unauthorized') ? 403 : error.message.includes('authorization') ? 401 : 400;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Operation failed',
    });
  }
}
