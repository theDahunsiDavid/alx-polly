"use client";

import { useState, useEffect } from 'react';
import { generatePollQR } from '@/lib/qr/qr-generator';

interface QRCodeProps {
  pollId: string;
  size?: number;
  className?: string;
}

export function QRCode({ pollId, size = 200, className }: QRCodeProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generatePollQR(pollId, { size })
      .then(setQrDataURL)
      .catch(() => setError('Failed to generate QR code'))
      .finally(() => setIsLoading(false));
  }, [pollId, size]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded animate-pulse border border-gray-200"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-500">Loading QR...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 border border-red-200 rounded text-red-600"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-center px-2">{error}</span>
      </div>
    );
  }

  return (
    <img
      src={qrDataURL}
      alt={`QR code for poll ${pollId}`}
      className={`border border-gray-200 rounded ${className || ''}`}
      width={size}
      height={size}
    />
  );
}
