// pages/api/admin.js - FLEXIBLE VERSION (Works with any users table structure)
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Admin API initializing...');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`\n📍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    if (req.method === 'GET') {
      const { action } = req.query;
      console.log('GET action:', action);

      if (action === 'stats') {
        const [usersRes, docsRes, reqRes, verRes, sharesRes, encRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
          supabase
            .from('verification_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase.from('document_shares').select('id', { count: 'exact', head: true }),
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('is_encrypted', true),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            totalUsers: usersRes.count || 0,
            totalDocuments: docsRes.count || 0,
            totalRequests: reqRes.count || 0,
            activeVerifications: verRes.count || 0,
            activeShares: sharesRes.count || 0,
            encryptedDocuments: encRes.count || 0,
          },
        });
      } else if (action === 'audit-logs') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return res.status(200).json({
          success: true,
          data: data || [],
        });
      } else if (action === 'security-events') {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }
    } else if (req.method === 'POST') {
      const { action, endpoint, userId } = req.body;
      console.log('POST endpoint:', endpoint, 'action:', action);

      // ===== DELETE USER =====
      if (action === 'delete-user') {
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'User ID is required',
          });
        }

        await supabase.from('documents').delete().eq('issuer_id', userId);
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;

        await supabase.from('audit_logs').insert({
          id: uuidv4(),
          action: 'user_deleted',
          actor_id: 'admin',
          resource_type: 'user',
          resource_id: userId,
          created_at: new Date().toISOString(),
        });

        return res.status(200).json({
          success: true,
          message: 'User deleted',
        });
      }

      // ===== CREATE ISSUER =====
      else if (endpoint === 'create-issuer') {
        console.log('🎯 Creating issuer account...');
        return await createIssuerAccount(req, res);
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid action or endpoint',
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid request method',
    });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

// ============================================
// CREATE ISSUER ACCOUNT
// ============================================
async function createIssuerAccount(req, res) {
  const {
    businessType,
    organizationName,
    tinNumber,
    address,
    businessLastName,
    proprietorFirstName,
    proprietorMiddleName,
    proprietorLastName,
    proprietorAddress,
    proprietorTin,
    personFirstName,
    personMiddleName,
    personLastName,
    personEmail,
    personViber,
    personPhone,
    signaturaid,
  } = req.body;

  console.log('📋 Received data:');
  console.log('  Organization:', organizationName);
  console.log('  Email:', personEmail);

  // ===== VALIDATION =====
  if (!organizationName?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Organization name is required',
    });
  }

  if (!tinNumber?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'TIN number is required',
    });
  }

  if (!personEmail?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Email is required',
    });
  }

  try {
    const issuerId = uuidv4();
    const tempPassword = `Temp${Date.now().toString().slice(-6)}@`;

    console.log('\nStep 1: Creating user account...');

    // Build user object with only the most essential fields
    // This way it works with any users table structure
    const userPayload = {
      id: issuerId,
      email: personEmail.toLowerCase().trim(),
      password: tempPassword,
      role: 'issuer',
    };

    // Only add optional fields if the values exist
    if (organizationName?.trim()) {
      userPayload.organization_name = organizationName.trim();
    }
    if (personFirstName?.trim()) {
      userPayload.first_name = personFirstName.trim();
    }
    if (personMiddleName?.trim()) {
      userPayload.middle_name = personMiddleName.trim();
    }
    if (personLastName?.trim()) {
      userPayload.last_name = personLastName.trim();
    }
    if (personPhone?.trim()) {
      userPayload.phone_number = personPhone.trim();
    }
    if (personViber?.trim()) {
      userPayload.viber_number = personViber.trim();
    }
    if (address?.trim()) {
      userPayload.address = address.trim();
    }
    if (signaturaid?.trim()) {
      userPayload.signatura_id = signaturaid.trim();
    }

    console.log('User payload:', JSON.stringify(userPayload, null, 2));

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(userPayload)
      .select()
      .single();

    if (userError) {
      console.error('❌ User creation failed:', userError);

      // If it fails due to missing columns, try with just essential fields
      console.log('⚠️ Retrying with minimal fields...');

      const minimalPayload = {
        id: issuerId,
        email: personEmail.toLowerCase().trim(),
        password: tempPassword,
        role: 'issuer',
      };

      const { data: minimalData, error: minimalError } = await supabase
        .from('users')
        .insert(minimalPayload)
        .select()
        .single();

      if (minimalError) {
        console.error('❌ Minimal payload also failed:', minimalError);
        return res.status(400).json({
          success: false,
          error: `User creation failed: ${minimalError.message}. Please ensure users table exists.`,
        });
      }

      console.log('✅ User created with minimal fields:', issuerId);
    } else {
      console.log('✅ User created:', issuerId);
    }

    // ===== STEP 2: Create Issuer Details (Optional) =====
    console.log('\nStep 2: Creating issuer details...');

    try {
      const issuerPayload = {
        id: uuidv4(),
        user_id: issuerId,
        business_type: businessType || 'corporation',
        organization_name: organizationName?.trim(),
        tin_number: tinNumber?.trim(),
        address: address?.trim(),
        business_last_name: businessLastName?.trim(),
        proprietor_first_name: proprietorFirstName?.trim(),
        proprietor_middle_name: proprietorMiddleName?.trim(),
        proprietor_last_name: proprietorLastName?.trim(),
        proprietor_address: proprietorAddress?.trim(),
        proprietor_tin: proprietorTin?.trim(),
        authorized_first_name: personFirstName?.trim(),
        authorized_middle_name: personMiddleName?.trim(),
        authorized_last_name: personLastName?.trim(),
        authorized_email: personEmail.toLowerCase().trim(),
        authorized_viber: personViber?.trim(),
        authorized_phone: personPhone?.trim(),
        signatura_id: signaturaid?.trim(),
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const { error: issuerError } = await supabase
        .from('issuer_details')
        .insert(issuerPayload);

      if (issuerError) {
        console.warn('⚠️ Issuer details warning:', issuerError.message);
      } else {
        console.log('✅ Issuer details created');
      }
    } catch (err) {
      console.warn('⚠️ Issuer details error:', err.message);
    }

    // ===== STEP 3: Create Audit Log (Optional) =====
    console.log('\nStep 3: Creating audit log...');

    try {
      await supabase.from('audit_logs').insert({
        id: uuidv4(),
        action: 'ISSUER_ACCOUNT_CREATED',
        actor_id: 'admin',
        actor_email: 'admin@system',
        resource_type: 'issuer_account',
        resource_id: issuerId,
        resource_name: organizationName,
        details: JSON.stringify({
          business_type: businessType,
          tin_number: tinNumber,
        }),
        created_at: new Date().toISOString(),
      });
      console.log('✅ Audit log created');
    } catch (err) {
      console.warn('⚠️ Audit log warning:', err.message);
    }

    console.log('\n✅✅✅ SUCCESS! Account created!');

    return res.status(201).json({
      success: true,
      data: {
        issuerId,
        signaturaid: signaturaid || `SIG-${Date.now()}`,
        organizationName,
        authorizedEmail: personEmail,
        tempPassword,
        message: 'Issuer account created successfully',
      },
    });
  } catch (error) {
    console.error('\n❌ Create issuer error:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create issuer account',
    });
  }
}
