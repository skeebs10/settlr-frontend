import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Download, Mail, MessageSquare, QrCode, Hash, Info, Check, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string;
  receiptUrl: string;
  receiptCode: string;
}

export function ShareReceiptModal({ 
  isOpen, 
  onClose, 
  receiptId, 
  receiptUrl, 
  receiptCode 
}: ShareReceiptModalProps) {
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [showQR, setShowQR] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && firstActionRef.current) {
      firstActionRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const setLoading = (action: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [action]: loading }));
  };

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

  const showErrorToast = (message: string) => {
    toast.error(message, {
      duration: 3500,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
        border: 'none'
      },
      icon: <AlertTriangle className="w-4 h-4" />
    });
  };

  const handleCopyLink = async () => {
    setLoading('copy', true);
    
    try {
      await navigator.clipboard.writeText(receiptUrl);
      showSuccessToast('Link copied');
      // Analytics: share_success (method: copy_link)
    } catch (error) {
      showErrorToast("Couldn't copy—try again.");
      // Analytics: share_error (method: copy_link, error_message)
    } finally {
      setLoading('copy', false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading('pdf', true);
    
    try {
      // Placeholder for backend call
      await onDownloadPDF(receiptId);
      showSuccessToast('PDF ready');
      // Analytics: share_success (method: pdf)
    } catch (error) {
      showErrorToast('PDF download failed.');
      // Analytics: share_error (method: pdf, error_message)
    } finally {
      setLoading('pdf', false);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Settlr Receipt');
    const body = encodeURIComponent(`Here's my Settlr receipt: ${receiptUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    // Analytics: share_method_selected (method: email)
  };

  const handleSMS = () => {
    const body = encodeURIComponent(`Here's my Settlr receipt: ${receiptUrl}`);
    
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`sms:?body=${body}`, '_blank');
      // Analytics: share_method_selected (method: sms)
    } else {
      // Fallback to copy link on desktop
      handleCopyLink();
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
    // Analytics: share_method_selected (method: qr)
  };

  const handleCopyCode = async () => {
    setLoading('code', true);
    
    try {
      await navigator.clipboard.writeText(receiptCode);
      showSuccessToast('Code copied');
      // Analytics: share_success (method: copy_code)
    } catch (error) {
      showErrorToast("Couldn't copy—try again.");
      // Analytics: share_error (method: copy_code, error_message)
    } finally {
      setLoading('code', false);
    }
  };

  const handleDownloadQR = () => {
    // Placeholder for QR download
    showSuccessToast('QR code downloaded');
  };

  // Check if clipboard is available
  const isClipboardAvailable = navigator.clipboard && window.isSecureContext;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-[#1A1A1D] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-subtitle"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="share-modal-title" className="text-xl font-semibold text-white">
              Share your receipt
            </h2>
            <p id="share-modal-subtitle" className="text-sm text-[#B6BCC2] mt-1">
              Choose how you'd like to share.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8D949B] hover:text-white transition-colors rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showQR ? (
          /* QR Code View */
          <div className="text-center">
            <div className="bg-white p-6 rounded-xl mb-4 inline-block">
              {/* Placeholder QR Code */}
              <div className="w-48 h-48 bg-black flex items-center justify-center">
                <QrCode className="w-24 h-24 text-white" />
              </div>
            </div>
            <p className="text-[#B6BCC2] text-sm mb-4">Scan to view receipt</p>
            <div className="space-y-3">
              <button
                onClick={handleDownloadQR}
                className="w-full btn-outlined py-3 font-medium"
              >
                Download QR
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="w-full btn-primary py-3 font-medium"
              >
                Back to options
              </button>
            </div>
          </div>
        ) : (
          /* Share Options Grid */
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {/* Copy Link */}
              {isClipboardAvailable && (
                <button
                  ref={firstActionRef}
                  onClick={handleCopyLink}
                  disabled={loadingStates.copy}
                  className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                  aria-label="Copy link to receipt"
                >
                  {loadingStates.copy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">Copy link</span>
                </button>
              )}

              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                disabled={loadingStates.pdf}
                className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                aria-label="Download PDF receipt"
              >
                {loadingStates.pdf ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">Download PDF</span>
              </button>

              {/* Email */}
              <button
                onClick={handleEmail}
                className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                aria-label="Share via email"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">Email</span>
              </button>

              {/* Text/SMS */}
              <button
                onClick={handleSMS}
                className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                aria-label="Share via text message"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Text</span>
              </button>

              {/* QR Code */}
              <button
                onClick={handleShowQR}
                className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                aria-label="Show QR code"
              >
                <QrCode className="w-5 h-5" />
                <span className="text-sm font-medium">Show QR</span>
              </button>

              {/* Copy Code */}
              {isClipboardAvailable && (
                <button
                  onClick={handleCopyCode}
                  disabled={loadingStates.code}
                  className="btn-outlined p-4 h-auto flex flex-col items-center space-y-2 min-h-[88px]"
                  aria-label="Copy receipt code"
                >
                  {loadingStates.code ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Hash className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">Copy code</span>
                </button>
              )}
            </div>

            {/* Privacy Footer */}
            <div className="relative">
              <button
                onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
                className="flex items-center text-sm text-[#8D949B] hover:text-[#B6BCC2] transition-colors"
              >
                <Info className="w-4 h-4 mr-1" />
                Privacy & security
              </button>
              
              {showPrivacyInfo && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#2A2F35] text-white text-xs p-3 rounded-lg shadow-lg max-w-xs">
                  Only people with the link can view this receipt.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Placeholder function for PDF download
async function onDownloadPDF(receiptId: string): Promise<void> {
  // TODO: call backend: GET /api/receipt/{id}/pdf
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success/failure
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error('PDF generation failed'));
      }
    }, 1500);
  });
}