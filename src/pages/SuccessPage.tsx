import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store';
import { CheckCircle, Eye, Receipt, Plus } from 'lucide-react';
import { ShareReceiptButton } from '../components/ShareReceiptButton';
import toast from 'react-hot-toast';

export function SuccessPage() {
  const navigate = useNavigate();
  const { currentCheck, myClaimedItems, getMySubtotal } = useAppStore();
  const [hasShownToast, setHasShownToast] = useState(false);

  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getMyTax = () => {
    if (!currentCheck) return 0;
    const taxRate = currentCheck.totals.tax_cents / currentCheck.totals.subtotal_cents;
    return Math.round(getMySubtotal() * taxRate);
  };

  const getMyTotal = () => {
    return getMySubtotal() + getMyTax() + 1800; // Mock tip amount
  };

  useEffect(() => {
    if (!hasShownToast) {
      toast.success('Payment successful', {
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
      setHasShownToast(true);
    }
  }, [hasShownToast]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Receipt',
          text: `Payment of ${formatCents(getMyTotal())} completed successfully`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Receipt link copied to clipboard!');
    }
  };

  const handleNewTab = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="py-12 md:py-16 text-center">
        <div className="container-settlr">
          {/* Hero Confirmation */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#244D30] flex items-center justify-center mx-auto mb-6 md:mb-8">
            <CheckCircle 
              className="w-8 h-8 md:w-10 md:h-10 text-white" 
              style={{ 
                animation: 'bounce 1s ease-in-out 3 alternate, scale 0.15s ease-in-out'
              }} 
            />
          </div>

          {/* Success message */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">Payment Complete!</h1>
          <p className="text-sm md:text-base lg:text-lg mb-6 md:mb-8 text-[#B6BCC2]">
            Your payment of {formatCents(getMyTotal())} has been processed successfully.
          </p>

          {/* Receipt Summary Card */}
          <div className="card-default mb-6 md:mb-8 max-w-md mx-auto">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-[#B6BCC2]">Subtotal:</span>
                <span className="font-medium text-white label">{formatCents(getMySubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-[#B6BCC2]">Tax:</span>
                <span className="font-medium text-white label">{formatCents(getMyTax())}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-[#B6BCC2]">Tip:</span>
                <span className="font-medium text-white label">{formatCents(1800)}</span>
              </div>
              <div className="border-t border-[#2A2F35]"></div>
              <div className="flex justify-between text-base md:text-lg font-semibold pt-2">
                <span className="text-white">Paid today:</span>
                <span className="text-[#009B3A]">{formatCents(getMyTotal())}</span>
              </div>
            </div>
            
            {/* Payment details */}
            <div className="text-center">
              <p className="text-xs md:text-sm text-[#8D949B]">
                Paid with •••• 1234 · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} · Confirmation #A1B2C3
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 md:space-y-4 max-w-md mx-auto">
            <button
              onClick={() => navigate(`/tab/${currentCheck?.check_id}`)}
              className="w-full btn-outlined py-4 font-medium flex items-center justify-center"
            >
              <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              View Tab
            </button>

            <ShareReceiptButton
              receiptId={currentCheck?.check_id || 'demo_receipt'}
              className="w-full py-4 font-medium flex items-center justify-center"
            />

            <button
              onClick={handleNewTab}
              className="w-full btn-primary py-4 font-semibold flex items-center justify-center"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start New Tab
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-sm md:text-base font-medium text-[#8D949B]">
              Powered by <span className="gradient-text">Settlr</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}