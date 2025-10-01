import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettlrStore } from '../store/settlr-store';
import { CheckCircle, Eye, Plus } from 'lucide-react';
import { ShareReceiptButton } from '../components/ShareReceiptButton';
import toast from 'react-hot-toast';

export function PaymentCompletePage() {
  const navigate = useNavigate();
  const { currentTab, getUserClaimedTotal, tipAmount } = useSettlrStore();
  const [hasShownToast, setHasShownToast] = React.useState(false);
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const subtotal = getUserClaimedTotal();
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax + tipAmount;
  
  useEffect(() => {
    if (!hasShownToast) {
      toast.success('Payment successful', {
        duration: 2500,
        style: {
          background: '#1A1A1D',
          color: '#FFFFFF',
          borderRadius: '12px',
        },
        iconTheme: {
          primary: '#009B3A',
          secondary: '#FFFFFF'
        }
      });
      setHasShownToast(true);
    }
  }, [hasShownToast]);
  
  if (!currentTab) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-lg">No tab found</p>
          <button 
            onClick={() => navigate('/split')}
            className="btn-primary mt-4 px-6 py-3"
          >
            Start New Tab
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary">
      <div className="container-settlr py-12 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-claimed-bg flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        {/* Success Message */}
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
          Payment Complete!
        </h1>
        <p className="text-text-secondary mb-8">
          Your payment of {formatCents(total)} has been processed successfully.
        </p>
        
        {/* Receipt Summary */}
        <div className="card-default mb-8 max-w-md mx-auto">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal:</span>
              <span className="font-medium text-text-primary">{formatCents(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tax:</span>
              <span className="font-medium text-text-primary">{formatCents(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tip:</span>
              <span className="font-medium text-text-primary">{formatCents(tipAmount)}</span>
            </div>
            <div className="border-t border-divider"></div>
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span className="text-text-primary">Paid today:</span>
              <span className="text-brand-primary">{formatCents(total)}</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-text-muted">
              Paid with •••• 1234 · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} · Confirmation #A1B2C3
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => navigate(`/tab/${currentTab.id}`)}
            className="w-full btn-outlined py-4 font-medium flex items-center justify-center focus-ring"
          >
            <Eye className="w-5 h-5 mr-2" />
            View Tab
          </button>
          
          <ShareReceiptButton
            receiptId={currentTab.id}
            className="w-full py-4 font-medium flex items-center justify-center"
          />
          
          <button
            onClick={() => navigate('/split')}
            className="w-full btn-primary py-4 font-semibold flex items-center justify-center focus-ring"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Tab
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-text-muted">
            Powered by <span className="gradient-text font-medium">Settlr</span>
          </p>
        </div>
      </div>
    </div>
  );
}