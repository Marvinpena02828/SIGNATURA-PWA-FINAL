// src/services/signatureEngine.js
// Cryptographic Signature Engine - Signs and verifies documents using Ed25519

import * as crypto from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';

/**
 * Generate a new keypair for signing
 * Used when issuer creates account
 */
export const generateKeyPair = () => {
  const keyPair = crypto.sign.keyPair();
  
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
};

/**
 * Sign a document/credential
 * @param {Object} documentData - The data to sign
 * @param {string} secretKey - Base64 encoded secret key
 * @returns {Object} Signed document with signature
 */
export const signDocument = (documentData, secretKey) => {
  try {
    // Convert data to JSON string for signing
    const dataString = JSON.stringify(documentData);
    const message = naclUtil.decodeUTF8(dataString);
    
    // Decode secret key
    const secretKeyBytes = naclUtil.decodeBase64(secretKey);
    
    // Sign the message
    const signedMessage = crypto.sign(message, secretKeyBytes);
    const signature = naclUtil.encodeBase64(signedMessage);
    
    return {
      success: true,
      signature: signature,
      documentHash: hashDocument(documentData),
      signedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Signing error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify a signed document
 * @param {Object} documentData - The original document data
 * @param {string} signature - Base64 encoded signature
 * @param {string} publicKey - Base64 encoded public key
 * @returns {boolean} True if signature is valid
 */
export const verifySignature = (documentData, signature, publicKey) => {
  try {
    // Reconstruct original message
    const dataString = JSON.stringify(documentData);
    const message = naclUtil.decodeUTF8(dataString);
    
    // Decode signature and public key
    const signatureBytes = naclUtil.decodeBase64(signature);
    const publicKeyBytes = naclUtil.decodeBase64(publicKey);
    
    // Verify signature
    const verifiedMessage = crypto.sign.open(signatureBytes, publicKeyBytes);
    
    return verifiedMessage !== null;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

/**
 * Create SHA-256 hash of document
 * @param {Object} documentData - Document to hash
 * @returns {string} Hex encoded hash
 */
export const hashDocument = async (documentData) => {
  try {
    const dataString = JSON.stringify(documentData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Hashing error:', error);
    throw error;
  }
};

/**
 * Create a cryptographic proof of document ownership
 * @param {string} documentId - ID of document
 * @param {string} ownerId - ID of owner
 * @param {string} secretKey - Owner's secret key
 * @returns {Object} Proof object
 */
export const createOwnershipProof = (documentId, ownerId, secretKey) => {
  try {
    const proofData = {
      documentId,
      ownerId,
      timestamp: new Date().toISOString(),
      nonce: crypto.randomBytes(16),
    };
    
    const { signature } = signDocument(proofData, secretKey);
    
    return {
      success: true,
      proof: {
        ...proofData,
        signature,
        nonce: naclUtil.encodeBase64(proofData.nonce),
      },
    };
  } catch (error) {
    console.error('Proof creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify ownership proof
 * @param {Object} proof - The proof object
 * @param {string} publicKey - Owner's public key
 * @returns {boolean} True if proof is valid
 */
export const verifyOwnershipProof = (proof, publicKey) => {
  try {
    const { signature, ...proofData } = proof;
    proofData.nonce = naclUtil.decodeBase64(proof.nonce);
    
    return verifySignature(proofData, signature, publicKey);
  } catch (error) {
    console.error('Proof verification error:', error);
    return false;
  }
};

/**
 * Create a signed document object
 * Complete document ready for storage
 */
export const createSignedDocument = (documentData, issuerSecretKey, issuerPublicKey) => {
  try {
    const { signature, documentHash } = signDocument(documentData, issuerSecretKey);
    
    return {
      documentId: documentData.id || crypto.randomBytes(16),
      documentData,
      issuer: {
        publicKey: issuerPublicKey,
        signature,
      },
      documentHash,
      signedAt: new Date().toISOString(),
      version: '1.0',
      isValid: true,
    };
  } catch (error) {
    console.error('Signed document creation error:', error);
    return null;
  }
};

/**
 * Validate a complete signed document
 */
export const validateSignedDocument = (signedDoc) => {
  try {
    const isSignatureValid = verifySignature(
      signedDoc.documentData,
      signedDoc.issuer.signature,
      signedDoc.issuer.publicKey
    );
    
    return {
      isValid: isSignatureValid,
      documentId: signedDoc.documentId,
      issuerPublicKey: signedDoc.issuer.publicKey,
      signedAt: signedDoc.signedAt,
      message: isSignatureValid ? 'Document is authentic' : 'Document signature is invalid',
    };
  } catch (error) {
    console.error('Document validation error:', error);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

/**
 * Create a verification token for sharing documents
 * Used in consent flow
 */
export const createVerificationToken = (documentId, ownerPublicKey, verifierEmail, expiresIn = 7) => {
  try {
    const tokenData = {
      documentId,
      ownerPublicKey,
      verifierEmail,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString(),
      token: naclUtil.encodeBase64(crypto.randomBytes(32)),
    };
    
    return tokenData;
  } catch (error) {
    console.error('Token creation error:', error);
    return null;
  }
};

/**
 * Verify a verification token
 */
export const verifyToken = (token) => {
  const now = new Date();
  const expiresAt = new Date(token.expiresAt);
  
  return {
    isValid: now < expiresAt,
    isExpired: now >= expiresAt,
    expiresIn: Math.max(0, Math.floor((expiresAt - now) / (1000 * 60))), // minutes
  };
};

export default {
  generateKeyPair,
  signDocument,
  verifySignature,
  hashDocument,
  createOwnershipProof,
  verifyOwnershipProof,
  createSignedDocument,
  validateSignedDocument,
  createVerificationToken,
  verifyToken,
};
