// pages/api/admin.js - Production-Ready Admin Operations
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ===== INITIALIZE SUPABASE =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Missing Supabase credentials in environment!');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== INITIALIZE EMAIL =====
let emailTransporter = null;

if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    console.log('✅ Email transporter initialized');
  } catch (err) {
    console.warn('⚠️ Failed to initialize email:', err.message);
  }
} else {
  console.warn('⚠️ Gmail credentials not found - email notifications will be skipped');
}

// ===== MAIN HANDLER =====
export default async function handler(req, res) {
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
      else if (action === 'audit-logs') {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return res.status(200).json({ success: true, data: data || [] });
      }
    }
    else if (req.method === 'POST') {
      const { action, endpoint, userId } = req.body;

      // Delete User
      if (action === 'delete-user') {
        console.log('🗑️ Deleting user:', userId);
        
        await supabase.from('documents').delete().eq('issuer_id', userId);
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;

        await supabase.from('audit_logs').insert({
          id: uuidv4(),
          actor_id: userId,
          action: 'user_deleted',
          resource_type: 'user',
          resource_id: userId,
          created_at: new Date().toISOString(),
        });

        console.log('✅ User deleted:', userId);
        return res.status(200).json({ success: true, message: 'User deleted' });
      }

      // Create Issuer Account
      else if (endpoint === 'create-issuer') {
        console.log('📋 Processing create-issuer request...');
        return await createIssuerAccount(req, res);
      }

      return res.status(400).json({ 
        success: false,
        error: 'Invalid action or endpoint' 
      });
    }

    return res.status(400).json({ 
      success: false,
      error: 'Invalid request method' 
    });
  } catch (error) {
    console.error('❌ Admin API Error:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Operation failed',
      timestamp: new Date().toISOString(),
    });
  }
}

// ===== CREATE ISSUER ACCOUNT =====
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
    tempPassword,
    logoBase64,
  } = req.body;

  console.log('📋 Creating issuer account...', { 
    organizationName, 
    personEmail,
    businessType 
  });

  // ===== VALIDATION =====
  const validationError = validateIssuerInput({
    organizationName,
    tinNumber,
    address,
    businessType,
    proprietorFirstName,
    proprietorLastName,
    personFirstName,
    personLastName,
    personEmail,
  });

  if (validationError) {
    console.warn('⚠️ Validation failed:', validationError);
    return res.status(400).json({
      success: false,
      error: validationError,
    });
  }

  try {
    const issuerId = uuidv4();
    const hashedPassword = crypto.createHash('sha256').update(tempPassword).digest('hex');

    // ===== STEP 1: Create User Account =====
    console.log('✅ Step 1/5: Creating user account...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
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
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ User creation failed:', userError.message);
      throw new Error(`Failed to create user account: ${userError.message}`);
    }

    console.log('✅ User created successfully:', issuerId);

    // ===== STEP 2: Create Issuer Details =====
    console.log('✅ Step 2/5: Creating issuer details...');
    const issuerDetailsId = uuidv4();
    
    const issuerDetailsPayload = {
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

    const { data: issuerData, error: issuerError } = await supabase
      .from('issuer_details')
      .insert(issuerDetailsPayload)
      .select()
      .single();

    if (issuerError) {
      console.error('❌ Issuer details creation failed:', issuerError.message);
      // Rollback: delete the user
      await supabase.from('users').delete().eq('id', issuerId).catch(() => {});
      throw new Error(`Failed to create issuer details: ${issuerError.message}`);
    }

    console.log('✅ Issuer details created:', issuerDetailsId);

    // ===== STEP 3: Upload Logo =====
    if (logoBase64) {
      console.log('✅ Step 3/5: Uploading logo...');
      try {
        const fileBuffer = Buffer.from(logoBase64.split(',')[1] || logoBase64, 'base64');
        const filePath = `issuer-logos/${issuerId}/logo.png`;

        const { error: uploadError } = await supabase.storage
          .from('issuer-assets')
          .upload(filePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('issuer-assets')
            .getPublicUrl(filePath);

          await supabase
            .from('issuer_details')
            .update({ logo_url: publicUrl })
            .eq('user_id', issuerId);

          console.log('✅ Logo uploaded:', publicUrl);
        } else {
          console.warn('⚠️ Logo upload failed:', uploadError.message);
        }
      } catch (logoErr) {
        console.warn('⚠️ Logo upload error (non-critical):', logoErr.message);
      }
    } else {
      console.log('⏭️ Step 3/5: Skipping logo upload (not provided)');
    }

    // ===== STEP 4: Send Email =====
    console.log('✅ Step 4/5: Sending email credentials...');
    if (emailTransporter) {
      try {
        const emailHtml = generateEmailTemplate({
          personFirstName,
          personLastName,
          organizationName,
          signaturaid,
          personEmail,
          tempPassword,
          year: new Date().getFullYear(),
          frontendUrl: process.env.FRONTEND_URL || 'https://signatura.app',
        });

        await emailTransporter.sendMail({
          from: process.env.GMAIL_USER,
          to: personEmail,
          subject: `🔐 Signatura Account Created - ${organizationName}`,
          html: emailHtml,
        });

        console.log('✅ Email sent to:', personEmail);
      } catch (emailErr) {
        console.warn('⚠️ Email sending failed (non-critical):', emailErr.message);
      }
    } else {
      console.warn('⏭️ Step 4/5: Email transporter not configured');
    }

    // ===== STEP 5: Create Audit Log =====
    console.log('✅ Step 5/5: Creating audit log...');
    try {
      await supabase
        .from('audit_logs')
        .insert({
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
            signatura_id: signaturaid,
          },
          created_at: new Date().toISOString(),
        });
      console.log('✅ Audit log created');
    } catch (auditErr) {
      console.warn('⚠️ Audit log creation failed:', auditErr.message);
    }

    console.log('✅ ✅ ✅ ISSUER ACCOUNT CREATED SUCCESSFULLY!', issuerId);

    return res.status(201).json({
      success: true,
      data: {
        issuerId,
        signaturaid,
        organizationName,
        authorizedEmail: personEmail,
        message: 'Issuer account created successfully',
        emailSent: !!emailTransporter,
      },
    });
  } catch (error) {
    console.error('❌ Create issuer error:', error.message);
    console.error('Full error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create issuer account',
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
    });
  }
}

// ===== HELPER FUNCTIONS =====

function validateIssuerInput({
  organizationName,
  tinNumber,
  address,
  businessType,
  proprietorFirstName,
  proprietorLastName,
  personFirstName,
  personLastName,
  personEmail,
}) {
  if (!organizationName?.trim()) {
    return 'Organization name is required';
  }

  if (!tinNumber?.trim()) {
    return 'TIN number is required';
  }

  if (!address?.trim()) {
    return 'Address is required';
  }

  if (businessType === 'sole_proprietor') {
    if (!proprietorFirstName?.trim()) {
      return 'Proprietor first name is required for sole proprietors';
    }
    if (!proprietorLastName?.trim()) {
      return 'Proprietor last name is required for sole proprietors';
    }
  }

  if (!personFirstName?.trim()) {
    return 'Authorized personnel first name is required';
  }

  if (!personLastName?.trim()) {
    return 'Authorized personnel last name is required';
  }

  if (!personEmail?.trim()) {
    return 'Authorized personnel email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(personEmail)) {
    return 'Invalid email address format';
  }

  return null;
}

function generateEmailTemplate({
  personFirstName,
  personLastName,
  organizationName,
  signaturaid,
  personEmail,
  tempPassword,
  year,
  frontendUrl,
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 4px solid #7c3aed;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          color: #7c3aed;
          margin: 0;
          font-size: 28px;
        }
        .content {
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .content p {
          margin: 15px 0;
        }
        .credentials-box {
          background-color: #f9fafb;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          border-radius: 4px;
        }
        .credentials-box div {
          margin: 12px 0;
        }
        .label {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
        }
        .value {
          color: #000;
          background-color: #e5e7eb;
          padding: 10px 12px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 5px;
          word-break: break-all;
          font-weight: 500;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          color: #92400e;
          border-radius: 4px;
        }
        .warning strong {
          color: #b45309;
        }
        .button {
          display: inline-block;
          background-color: #7c3aed;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 20px;
          font-weight: bold;
          text-align: center;
        }
        .button:hover {
          background-color: #6d28d9;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .steps {
          background-color: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .steps h4 {
          color: #16a34a;
          margin-top: 0;
        }
        .steps li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Welcome to Signatura</h1>
        </div>
        
        <div class="content">
          <p>Hello <strong>${personFirstName} ${personLastName}</strong>,</p>
          
          <p>Your issuer account has been successfully created! Your organization is now ready to start issuing digital documents.</p>
          
          <div class="credentials-box">
            <div>
              <div class="label">📦 Organization:</div>
              <div class="value">${organizationName}</div>
            </div>
            
            <div>
              <div class="label">🆔 SIGNATURA ID:</div>
              <div class="value">${signaturaid}</div>
            </div>
            
            <div>
              <div class="label">📧 Email:</div>
              <div class="value">${personEmail}</div>
            </div>
            
            <div>
              <div class="label">🔑 Temporary Password:</div>
              <div class="value">${tempPassword}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong> Please change your password immediately after your first login. Your temporary password is valid for 24 hours.
          </div>
          
          <a href="${frontendUrl}/login" class="button">Login to Your Account →</a>
          
          <div class="steps">
            <h4>✅ Getting Started:</h4>
            <ol>
              <li>Log in using the credentials above</li>
              <li>Update your profile and company information</li>
              <li>Change your temporary password</li>
              <li>Configure your document templates</li>
              <li>Start issuing digital documents</li>
            </ol>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        
        <div class="footer">
          <p>© ${year} Signatura. All rights reserved.</p>
          <p>This email was sent to ${personEmail}. If you did not expect this email, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
