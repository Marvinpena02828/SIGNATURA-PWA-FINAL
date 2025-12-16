// api/encryption.js - Document encryption/decryption endpoints
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { action, documentId, userId, data } = req.body;

      if (action === 'generate-keys') {
        // Generate and store user's key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        // Store public key (can be shared)
        await supabase.from('user_keys').insert({
          user_id: userId,
          public_key: publicKey,
          created_at: new Date().toISOString(),
        });

        // Return private key (user should save this securely)
        return res.status(200).json({
          success: true,
          privateKey, // User must store this securely
          publicKey,
          message: 'Key pair generated. Store the private key securely!',
        });
      } 
      else if (action === 'encrypt-document') {
        // Get owner's public key
        const { data: keyData } = await supabase
          .from('user_keys')
          .select('public_key')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!keyData) {
          return res.status(400).json({ error: 'User key not found' });
        }

        // Encrypt data
        const encrypted = crypto.publicEncrypt(
          keyData.public_key,
          Buffer.from(JSON.stringify(data))
        );

        // Store encrypted document
        const { data: docData, error } = await supabase
          .from('documents')
          .update({
            document_encrypted: encrypted.toString('base64'),
            is_encrypted: true,
          })
          .eq('id', documentId)
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({
          success: true,
          document: docData,
          message: 'Document encrypted successfully',
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } 
    else if (req.method === 'GET') {
      // Get user's public key
      const { userId } = req.query;

      const { data, error } = await supabase
        .from('user_keys')
        .select('public_key, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return res.status(404).json({ error: 'User key not found' });
      }

      return res.status(200).json({
        success: true,
        publicKey: data.public_key,
        createdAt: data.created_at,
      });
    }
  } catch (error) {
    console.error('Encryption API error:', error);
    return res.status(500).json({
      error: error.message || 'Encryption operation failed',
    });
  }
}
