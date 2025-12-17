// api/document-requests.js - Student document requests
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // Create document request
      const {
        documentType,
        studentName,
        studentEmail,
        studentId,
        program,
        yearGraduated,
      } = req.body;

      if (!documentType || !studentName || !studentEmail || !studentId || !program) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate request ID
      const requestId = `REQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Create request record
      const { data, error } = await supabase
        .from('document_requests')
        .insert({
          request_id: requestId,
          document_type: documentType,
          student_name: studentName,
          student_email: studentEmail,
          student_id: studentId,
          program,
          year_graduated: yearGraduated,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log in audit trail
      await supabase.from('audit_logs').insert({
        action: 'document_request_created',
        resource_type: 'document_request',
        resource_id: data.id,
        details: { student_email: studentEmail, document_type: documentType },
      });

      return res.status(201).json({
        success: true,
        data: { id: requestId, ...data },
        message: 'Request submitted successfully',
      });
    } 
    else if (req.method === 'GET') {
      const { studentEmail, status } = req.query;

      let query = supabase.from('document_requests').select('*');
      
      if (studentEmail) {
        query = query.eq('student_email', studentEmail);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data: data || [] });
    } 
    else if (req.method === 'PUT') {
      // Update request status (for registrar)
      const { id, status, remarks } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (remarks) {
        updateData.remarks = remarks;
      }

      const { data, error } = await supabase
        .from('document_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log change
      await supabase.from('audit_logs').insert({
        action: `document_request_${status}`,
        resource_type: 'document_request',
        resource_id: id,
        details: { new_status: status },
      });

      return res.status(200).json({ success: true, data });
    } 
    else if (req.method === 'DELETE') {
      const { id } = req.body;

      const { error } = await supabase
        .from('document_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Request deleted' });
    }
  } catch (error) {
    console.error('Document requests error:', error);
    return res.status(500).json({
      error: error.message || 'Operation failed',
    });
  }
}
