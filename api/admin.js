// pages/api/admin.js - DEBUG VERSION with Verbose Logging
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

console.log('🚀 Admin API loading...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);

// ===== INITIALIZE SUPABASE =====
let supabase = null;

try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not defined!');
  }
  if (!supabaseKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not defined!');
  }

  console.log('✅ Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('✅ Supabase Key:', supabaseKey.substring(0, 20) + '...');

  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
} catch (err) {
  console.error('❌ CRITICAL: Failed to initialize Supabase:', err.message);
}

// ===== INITIALIZE EMAIL =====
let emailTransporter = null;

try {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    console.log('📧 Initializing email transporter...');
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    console.log('✅ Email transporter initialized with:', process.env.GMAIL_USER);
  } else {
    console.warn('⚠️ Gmail credentials missing - email will be skipped');
  }
} catch (err) {
  console.error('❌ Email initialization error:', err.message);
}

// ===== MAIN HANDLER =====
export default async function handler(req, res) {
  console.log('\n' + '='.repeat(60));
  console.log('📨 API Request Received');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('='.repeat(60) + '\n');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { action } = req.query;
      console.log('GET action:', action);

      if (action === 'stats') {
        const [usersRes, docsRes, reqRes, verRes, sharesRes, encRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('document_shares').select('id', { count: 'exact', head: true }),
          supabase.from('documents').select('id', { count: 'exact', head: true }).eq('is_encrypted', true),
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
      }
    }
    else if (req.method === 'POST') {
      const { action, endpoint, userId } = req.body;
      console.log('POST endpoint:', endpoint, 'action:', action);

      if (endpoint === 'create-issuer') {
        console.log('🎯 Routing to createIssuerAccount function...');
        return await createIssuerAccount(req, res);
      }

      return res.status(400).json({ success: false, error: 'Invalid action or endpoint' });
    }

    return res.status(400).json({ success: false, error: 'Invalid request method' });
  } catch (error) {
    console.error('\n' + '❌'.repeat(30));
    console.error('❌ UNHANDLED ERROR IN HANDLER');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌'.repeat(30) + '\n');

    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
    });
  }
}

// ===== CREATE ISSUER ACCOUNT =====
async function createIssuerAccount(req, res) {
  console.log('\n' + '█'.repeat(60));
  console.log('█ CREATE ISSUER ACCOUNT STARTED');
  console.log('█'.repeat(60));

  try {
    const body = req.body;
    console.log('Request body received with keys:', Object.keys(body));

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
      tempPassword,
      logoBase64,
    } = body;

    console.log('📋 Extracted variables:');
    console.log('  - organizationName:', organizationName);
    console.log('  - personEmail:', personEmail);
    console.log('  - businessType:', businessType);
    console.log('  - tinNumber:', tinNumber);
    console.log('  - signaturaid:', signaturaid);
    console.log('  - logoBase64 present:', !!logoBase64);

    // ===== VALIDATION =====
    console.log('\n🔍 Validating input...');
    if (!organizationName?.trim()) {
      throw new Error('Organization name is required');
    }
    console.log('  ✅ Organization name valid');

    if (!tinNumber?.trim()) {
      throw new Error('TIN number is required');
    }
    console.log('  ✅ TIN number valid');

    if (!address?.trim()) {
      throw new Error('Address is required');
    }
    console.log('  ✅ Address valid');

    if (!personEmail?.trim()) {
      throw new Error('Email is required');
    }
    console.log('  ✅ Email valid');

    if (businessType === 'sole_proprietor') {
      if (!proprietorFirstName?.trim() || !proprietorLastName?.trim()) {
        throw new Error('Proprietor name is required for sole proprietor');
      }
      console.log('  ✅ Proprietor info valid');
    }

    console.log('✅ All validation passed!\n');

    // ===== STEP 1: Create User =====
    console.log('Step 1/5: Creating user account...');
    console.log('  - ID: generating...');
    const issuerId = uuidv4();
    console.log('  - ID:', issuerId);

    console.log('  - Password: hashing...');
    const hashedPassword = crypto.createHash('sha256').update(tempPassword).digest('hex');
    console.log('  - Password hashed: ✅');

    console.log('  - Inserting into users table...');
    const userPayload = {
      id: issuerId,
      email: personEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: 'issuer',
      organization_name: organizationName.trim(),
      first_name: personFirstName?.trim() || null,
      middle_name: personMiddleName?.trim() || null,
      last_name: personLastName?.trim() || null,
      phone_number: personPhone?.trim() || null,
      viber_number: personViber?.trim() || null,
      address: address.trim(),
      signatura_id: signaturaid,
      created_at: new Date().toISOString(),
    };

    console.log('  - User Payload:', JSON.stringify(userPayload, null, 2));

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(userPayload)
      .select()
      .single();

    if (userError) {
      console.error('  ❌ User creation failed!');
      console.error('  Error:', userError);
      throw new Error(`User creation failed: ${userError.message}`);
    }

    console.log('  ✅ User created:', issuerId);

    // ===== STEP 2: Create Issuer Details =====
    console.log('\nStep 2/5: Creating issuer details...');
    const issuerDetailsId = uuidv4();
    console.log('  - ID:', issuerDetailsId);

    const issuerPayload = {
      id: issuerDetailsId,
      user_id: issuerId,
      business_type: businessType,
      organization_name: organizationName.trim(),
      tin_number: tinNumber.trim(),
      address: address.trim(),
      business_last_name: businessLastName?.trim() || null,
      proprietor_first_name: proprietorFirstName?.trim() || null,
      proprietor_middle_name: proprietorMiddleName?.trim() || null,
      proprietor_last_name: proprietorLastName?.trim() || null,
      proprietor_address: proprietorAddress?.trim() || null,
      proprietor_tin: proprietorTin?.trim() || null,
      authorized_first_name: personFirstName?.trim() || null,
      authorized_middle_name: personMiddleName?.trim() || null,
      authorized_last_name: personLastName?.trim() || null,
      authorized_email: personEmail.toLowerCase().trim(),
      authorized_viber: personViber?.trim() || null,
      authorized_phone: personPhone?.trim() || null,
      signatura_id: signaturaid,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    console.log('  - Issuer Payload:', JSON.stringify(issuerPayload, null, 2));
    console.log('  - Inserting into issuer_details table...');

    const { data: issuerData, error: issuerError } = await supabase
      .from('issuer_details')
      .insert(issuerPayload)
      .select()
      .single();

    if (issuerError) {
      console.error('  ❌ Issuer details creation failed!');
      console.error('  Error:', issuerError);
      // Rollback
      console.log('  - Rolling back: deleting user...');
      await supabase.from('users').delete().eq('id', issuerId).catch(err => {
        console.error('  - Rollback error:', err.message);
      });
      throw new Error(`Issuer details creation failed: ${issuerError.message}`);
    }

    console.log('  ✅ Issuer details created:', issuerDetailsId);

    // ===== STEP 3: Logo Upload =====
    console.log('\nStep 3/5: Processing logo...');
    if (logoBase64) {
      console.log('  - Logo provided');
      try {
        const logoBuffer = Buffer.from(logoBase64.split(',')[1] || logoBase64, 'base64');
        const filePath = `issuer-logos/${issuerId}/logo.png`;
        console.log('  - File path:', filePath);
        console.log('  - Buffer size:', logoBuffer.length, 'bytes');
        console.log('  - Uploading to storage...');

        const { error: uploadError } = await supabase.storage
          .from('issuer-assets')
          .upload(filePath, logoBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          console.warn('  ⚠️ Upload error:', uploadError.message);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('issuer-assets')
            .getPublicUrl(filePath);

          console.log('  - Public URL:', publicUrl);
          console.log('  - Updating issuer_details with logo_url...');

          await supabase
            .from('issuer_details')
            .update({ logo_url: publicUrl })
            .eq('user_id', issuerId);

          console.log('  ✅ Logo uploaded and linked');
        }
      } catch (logoErr) {
        console.warn('  ⚠️ Logo processing error:', logoErr.message);
      }
    } else {
      console.log('  - No logo provided, skipping');
    }

    // ===== STEP 4: Send Email =====
    console.log('\nStep 4/5: Sending email...');
    if (emailTransporter) {
      try {
        console.log('  - Email transporter available');
        console.log('  - Building email HTML...');

        const emailHtml = `<html><body>Test email</body></html>`;
        console.log('  - Email HTML ready');

        console.log('  - Sending to:', personEmail);
        await emailTransporter.sendMail({
          from: process.env.GMAIL_USER,
          to: personEmail,
          subject: `Signatura Account Created - ${organizationName}`,
          html: emailHtml,
        });

        console.log('  ✅ Email sent');
      } catch (emailErr) {
        console.warn('  ⚠️ Email error:', emailErr.message);
      }
    } else {
      console.log('  - Email transporter not configured, skipping');
    }

    // ===== STEP 5: Audit Log =====
    console.log('\nStep 5/5: Creating audit log...');
    try {
      const auditPayload = {
        id: uuidv4(),
        action: 'ISSUER_ACCOUNT_CREATED',
        actor_id: 'admin',
        actor_email: 'admin@system',
        resource_type: 'issuer_account',
        resource_id: issuerId,
        resource_name: organizationName,
        details: {
          business_type: businessType,
          tin_number: tinNumber,
        },
        created_at: new Date().toISOString(),
      };

      console.log('  - Audit Payload:', JSON.stringify(auditPayload, null, 2));

      await supabase.from('audit_logs').insert(auditPayload);
      console.log('  ✅ Audit log created');
    } catch (auditErr) {
      console.warn('  ⚠️ Audit log error:', auditErr.message);
    }

    console.log('\n✅ ✅ ✅ SUCCESS! Account created:', issuerId);
    console.log('█'.repeat(60) + '\n');

    return res.status(201).json({
      success: true,
      data: {
        issuerId,
        signaturaid,
        organizationName,
        authorizedEmail: personEmail,
        message: 'Issuer account created successfully',
      },
    });
  } catch (error) {
    console.error('\n' + '❌'.repeat(30));
    console.error('CREATE ISSUER FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('❌'.repeat(30) + '\n');

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
