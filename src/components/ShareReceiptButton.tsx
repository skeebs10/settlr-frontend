import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { ShareReceiptModal } from './ShareReceiptModal';
import toast from 'react-hot-toast';

interface ShareReceiptButtonProps {
  receiptId: string;
  className?: string;
}

export function ShareReceiptButton({ receiptId, className = "" }: ShareReceiptButtonProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Placeholder constants (to be replaced by backend)
  const PUBLIC_RECEIPT_URL = `https://app.settlr.com/r/${receiptId}`;
  const RECEIPT_CODE = `TAB-${receiptId.slice(-4).toUpperCase()}`;

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      duration: 2500,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
        border: 'none'
      },
      iconTheme: {
        primary: '#009B3A',
        secondary: '#FFFFFF'
      }
    });
  };

  const handleShareClick = async () => {
    // Check if Web Share API is available and can share
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: 'Settlr Receipt',
        text: "Here's my Settlr receipt",
        url: PUBLIC_RECEIPT_URL
      };

      // Check if the data can be shared
      if (navigator.canShare(shareData)) {
        try {
          // Analytics: share_opened (source: button)
          await navigator.share(shareData);
          showSuccessToast('Receipt shared');
          // Analytics: share_success (method: native_share)
          return;
        } catch (error) {
          // User cancelled or share failed, fall back to modal
          // Analytics: share_error (method: native_share, error_message)
        }
      }
    }

    // Fallback to modal
    // Analytics: share_opened (source: modal_fallback)
    setShowModal(true);
  };

  // Check if receipt URL is available
  if (!PUBLIC_RECEIPT_URL) {
    return (
      <div className="relative">
        <button
          disabled
          className={`btn-outlined opacity-50 cursor-not-allowed ${className}`}
          title="Receipt link not ready"
        >
          <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Share Receipt
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleShareClick}
        className={`btn-outlined ${className}`}
      >
        <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Share Receipt
      </button>

      <ShareReceiptModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        receiptId={receiptId}
        receiptUrl={PUBLIC_RECEIPT_URL}
        receiptCode={RECEIPT_CODE}
      />
    </>
  );
}