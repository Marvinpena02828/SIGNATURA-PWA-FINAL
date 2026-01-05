import React from 'react';
import { FiCopy, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DocumentQRModal({ document, onClose }) {
  if (!document) return null;

  const documentQRData = {
    documentId: document.id,
    documentHash: document.document_hash || 'hash-' + document.id.substring(0, 8),
    issuer: document.issuer_organization || 'Unknown',
    fileName: document.file_name,
    issuedAt: document.created_at,
    type: document.document_type,
  };

  const documentQRString = JSON.stringify(documentQRData);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(documentQRString)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-signatura-dark">📄 Document Verification</h2>
          <p className="text-sm text-gray-600 mt-1">{document.file_name}</p>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Scan this QR to verify document authenticity</p>

          <div className="bg-gray-50 p-4 rounded-lg inline-block mb-6 border-2 border-green-500">
            <img src={qrUrl} alt="Document QR Code" className="w-64 h-64" />
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Document ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">{document.id}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Document Hash</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {document.document_hash || 'hash-' + document.id.substring(0, 8)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Issued By</p>
              <p className="text-sm text-gray-900">{document.issuer_organization || 'Unknown'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Issued Date</p>
              <p className="text-sm text-gray-900">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(documentQRString);
                toast.success('Document data copied!');
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrUrl;
                link.download = `${document.file_name.split('.')[0]}-verification.png`;
                link.click();
                toast.success('QR code downloaded!');
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 text-sm"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>

        <div className="p-4 bg-green-50 border-t border-gray-200">
          <p className="text-xs text-green-700">
            ✓ This QR code can be scanned by trusted users to verify document authenticity
          </p>
        </div>
      </div>
    </div>
  );
}
