"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCode } from '@/components/ui/qr-code';
import { getPollShareUrl } from '@/lib/qr/qr-generator';
import { Copy, Download, Share2 } from 'lucide-react';
import { Poll } from '@/types';

interface PollShareDialogProps {
  poll: Poll;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PollShareDialog({ poll, isOpen, onOpenChange }: PollShareDialogProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const shareUrl = getPollShareUrl(poll.id);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQR = () => {
    // Create a canvas element to convert the QR image to downloadable format
    const qrImage = document.querySelector('img[alt*="QR code"]') as HTMLImageElement;
    if (qrImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        ctx.drawImage(qrImage, 0, 0);

        const link = document.createElement('a');
        link.download = `poll-${poll.id}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: poll.description || 'Vote on this poll',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL if Web Share API is not available
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Poll</DialogTitle>
          <DialogDescription>
            Share this poll with others so they can vote
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <QRCode pollId={poll.id} size={200} />
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted focus:outline-none select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                size="sm"
                onClick={handleCopyUrl}
                variant={copySuccess ? "default" : "outline"}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Download QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Scan the QR code or share the link to let others vote on this poll</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
