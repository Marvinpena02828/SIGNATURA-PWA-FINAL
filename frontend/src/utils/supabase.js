import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth helpers
export const signUp = async (email, password, role, organizationName = null) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        role,
        organization_name: organizationName,
      });

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Document helpers
export const createDocument = async (issuerData, documentPayload) => {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getDocuments = async (filters = {}) => {
  let query = supabase.from('documents').select('*');

  if (filters.issuerId) {
    query = query.eq('issuer_id', filters.issuerId);
  }

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getDocumentById = async (documentId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  return data;
};

export const updateDocumentStatus = async (documentId, status) => {
  const { data, error } = await supabase
    .from('documents')
    .update({ status, updated_at: new Date() })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Verification helpers
export const createVerificationRequest = async (requestData) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .insert(requestData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getVerificationRequests = async (filters = {}) => {
  let query = supabase.from('verification_requests').select('*');

  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateVerificationRequest = async (requestId, updates) => {
  const { data, error } = await supabase
    .from('verification_requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Audit helpers
export const logAuditEvent = async (auditData) => {
  const { error } = await supabase
    .from('audit_logs')
    .insert(auditData);

  if (error) throw error;
};

export const getAuditLogs = async (filters = {}) => {
  let query = supabase.from('audit_logs').select('*');

  if (filters.actorId) {
    query = query.eq('actor_id', filters.actorId);
  }

  if (filters.documentId) {
    query = query.eq('document_id', filters.documentId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Revocation helpers
export const revokeDocument = async (documentId, revokedById, reason = null) => {
  const { error: revokeError } = await supabase
    .from('revocations')
    .insert({
      document_id: documentId,
      revoked_by_id: revokedById,
      reason,
    });

  if (revokeError) throw revokeError;

  const { error: updateError } = await supabase
    .from('documents')
    .update({ status: 'revoked' })
    .eq('id', documentId);

  if (updateError) throw updateError;
};

export const isDocumentRevoked = async (documentId) => {
  const { data, error } = await supabase
    .from('revocations')
    .select('id')
    .eq('document_id', documentId)
    .single();

  if (error && error.code === 'PGRST116') {
    return false; // Not revoked
  }

  if (error) throw error;
  return !!data;
};
