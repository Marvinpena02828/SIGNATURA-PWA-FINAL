// api/qrcode.js - QR Code generation for documents
import QRCode from 'qrcode';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, documentHash, issuerEmail } = req.body;

    if (!documentHash) {
      return res.status(400).json({ error: 'Missing documentHash' });
    }

    // Create verification URL with document hash
    const verificationUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/verify?hash=${documentHash}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
    });

    return res.status(200).json({
      success: true,
      qrCode: qrCodeDataUrl,
      verificationUrl,
      documentHash,
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate QR code',
    });
  }
}
