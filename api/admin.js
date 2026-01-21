// pages/api/admin.js - Admin operations (FIXED)
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ===== VALIDATION =====
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
  console.warn('⚠️ WARNING: Gmail environment variables not set - email will not work');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email configuration (with fallback)
const emailTransporter = process.env.GMAIL_USER && process.env.GMAIL_PASSWORD 
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })
  : null;

export default async function handler(req, res) {
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
        await supabase.from('documents').delete().eq('issuer_id', userId);
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;

        await supabase.from('audit_logs').insert({
          actor_id: userId,
          action: 'user_deleted',
          resource_type: 'user',
          resource_id: userId,
        });

        return res.status(200).json({ success: true, message: 'User deleted' });
      }

      // Create Issuer Account
      else if (endpoint === 'create-issuer') {
        return await createIssuerAccount(req, res);
      }

      return res.status(400).json({ error: 'Invalid action or endpoint' });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('❌ Admin API Error:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Operation failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
    tempPassword,
    logoBase64,
  } = req.body;

  console.log('📋 Creating issuer account...', { organizationName, personEmail });

  // Validation
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

  if (!address?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Address is required',
    });
  }

  if (!personEmail?.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Authorized personnel email is required',
    });
  }

  try {
    const issuerId = uuidv4();
    const hashedPassword = crypto.createHash('sha256').update(tempPassword).digest('hex');

    console.log('✅ Step 1: Creating user account...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: issuerId,
        email: personEmail,
        password: hashedPassword,
        role: 'issuer',
        organization_name: organizationName,
        first_name: personFirstName || null,
        middle_name: personMiddleName || null,
        last_name: personLastName || null,
        phone_number: personPhone || null,
        viber_number: personViber || null,
        address: address,
        signatura_id: signaturaid,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ User creation error:', userError);
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    console.log('✅ User created:', issuerId);

    // 2. Create issuer details record
    console.log('✅ Step 2: Creating issuer details...');
    const issuerDetailsId = uuidv4();
    
    const { data: issuerData, error: issuerError } = await supabase
      .from('issuer_details')
      .insert({
        id: issuerDetailsId,
        user_id: issuerId,
        business_type: businessType,
        organization_name: organizationName,
        tin_number: tinNumber,
        address: address,
        business_last_name: businessLastName || null,
        proprietor_first_name: proprietorFirstName || null,
        proprietor_middle_name: proprietorMiddleName || null,
        proprietor_last_name: proprietorLastName || null,
        proprietor_address: proprietorAddress || null,
        proprietor_tin: proprietorTin || null,
        authorized_first_name: personFirstName || null,
        authorized_middle_name: personMiddleName || null,
        authorized_last_name: personLastName || null,
        authorized_email: personEmail,
        authorized_viber: personViber || null,
        authorized_phone: personPhone || null,
        signatura_id: signaturaid,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (issuerError) {
      console.error('❌ Issuer details error:', issuerError);
      throw new Error(`Failed to create issuer details: ${issuerError.message}`);
    }

    console.log('✅ Issuer details created:', issuerData.id);

    // 3. Upload logo if provided
    if (logoBase64) {
      console.log('✅ Step 3: Uploading logo...');
      try {
        const fileBuffer = Buffer.from(logoBase64, 'base64');
        const filePath = `issuer-logos/${issuerId}/logo.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
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
          console.warn('⚠️ Logo upload error:', uploadError.message);
        }
      } catch (err) {
        console.warn('⚠️ Logo upload exception:', err.message);
      }
    }

    // 4. Send email with credentials
    console.log('✅ Step 4: Sending credentials to email...');
    if (emailTransporter) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { border-bottom: 4px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #7c3aed; margin: 0; font-size: 28px; }
              .content { margin-bottom: 30px; }
              .content p { margin: 10px 0; color: #333; line-height: 1.6; }
              .credentials-box { background-color: #f9fafb; border-left: 4px solid #7c3aed; padding: 20px; margin: 20px 0; font-family: monospace; }
              .credentials-box div { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
              .value { color: #000; background-color: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; word-break: break-all; }
              .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; color: #92400e; }
              .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
              .btn { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Welcome to Signatura Admin Portal</h1>
              </div>
              
              <div class="content">
                <p>Dear <strong>${personFirstName} ${personLastName}</strong>,</p>
                
                <p>Your issuer account has been successfully created! Below are your login credentials:</p>
                
                <div class="credentials-box">
                  <div>
                    <div class="label">Organization:</div>
                    <div class="value">${organizationName}</div>
                  </div>
                  
                  <div>
                    <div class="label">SIGNATURA ID:</div>
                    <div class="value">${signaturaid}</div>
                  </div>
                  
                  <div>
                    <div class="label">Email:</div>
                    <div class="value">${personEmail}</div>
                  </div>
                  
                  <div>
                    <div class="label">Temporary Password:</div>
                    <div class="value">${tempPassword}</div>
                  </div>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> Please change your password immediately after your first login. Your temporary password is valid for 24 hours.
                </div>
                
                <p>
                  <a href="${process.env.FRONTEND_URL || 'https://signatura.app'}/login" class="btn">Login to Your Account</a>
                </p>
                
                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Log in to your account using the credentials above</li>
                  <li>Update your profile information</li>
                  <li>Change your temporary password</li>
                  <li>Start creating and managing documents</li>
                </ul>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Signatura Admin Portal. All rights reserved.</p>
                <p>This email was sent to ${personEmail}. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await emailTransporter.sendMail({
          from: process.env.GMAIL_USER,
          to: personEmail,
          subject: `🔐 Signatura Account Created - ${organizationName}`,
          html: emailHtml,
        });

        console.log('✅ Email sent to:', personEmail);
      } catch (emailErr) {
        console.warn('⚠️ Email sending error:', emailErr.message);
      }
    } else {
      console.warn('⚠️ Email transporter not configured - skipping email');
    }

    // 5. Create audit log
    console.log('✅ Step 5: Creating audit log...');
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
    } catch (auditErr) {
      console.warn('⚠️ Audit log error:', auditErr.message);
    }

    console.log('✅ Issuer account created successfully:', issuerId);

    return res.status(201).json({
      success: true,
      data: {
        issuerId,
        signaturaid,
        organizationName,
        authorizedEmail: personEmail,
        message: 'Issuer account created and credentials sent to email',
      },
    });
  } catch (error) {
    console.error('❌ Create issuer error:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create issuer account',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
