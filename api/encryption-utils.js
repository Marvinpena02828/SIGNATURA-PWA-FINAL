// encryption-utils.js - End-to-End Encryption Utilities
import crypto from 'crypto';

// Generate RSA key pair for document owner
export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
}

// Encrypt document data with owner's public key
export function encryptDocument(documentData, publicKey) {
  try {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(JSON.stringify(documentData)));
    return encrypted.toString('base64');
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
}

// Decrypt document data with owner's private key
export function decryptDocument(encryptedData, privateKey) {
  try {
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
    return JSON.parse(decrypted.toString());
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

// Generate document hash with signature
export function generateDocumentSignature(documentData, issuerPrivateKey) {
  const dataString = JSON.stringify(documentData);
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');

  const sign = crypto.createSign('sha256');
  sign.update(dataString);
  const signature = sign.sign(issuerPrivateKey, 'base64');

  return { hash, signature };
}

// Verify document signature
export function verifyDocumentSignature(documentData, signature, issuerPublicKey) {
  try {
    const dataString = JSON.stringify(documentData);
    const verify = crypto.createVerify('sha256');
    verify.update(dataString);

    return verify.verify(issuerPublicKey, signature, 'base64');
  } catch (error) {
    return false;
  }
}

// Generate secret phrase for wallet recovery
export function generateSecretPhrase(length = 12) {
  const words = [
    'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'abuse',
    'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
    'across', 'act', 'action', 'actor', 'acts', 'actual', 'add', 'address',
    // Add more BIP39 words as needed
  ];

  const phrase = [];
  for (let i = 0; i < length; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)]);
  }

  return phrase.join(' ');
}

// Create deterministic key from secret phrase
export function deriveKeyFromPhrase(phrase, salt = 'signatura') {
  const key = crypto
    .pbkdf2Sync(phrase, salt, 100000, 32, 'sha256')
    .toString('hex');

  return key;
}

export default {
  generateKeyPair,
  encryptDocument,
  decryptDocument,
  generateDocumentSignature,
  verifyDocumentSignature,
  generateSecretPhrase,
  deriveKeyFromPhrase,
};
