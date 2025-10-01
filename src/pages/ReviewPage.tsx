import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { 
    session,
    currentCheck,
    getMyClaimedItems
  } = useAppStore();
  
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(18);
  const [customTip, setCustomTip] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Add debugging
  React.useEffect(() => {
    console.log('ReviewPage: Component mounted, session exists:', !!session, 'check exists:', !!currentCheck);
  }, [session, currentCheck]);
  
  const myClaimedItems = getMyClaimedItems();
  console.log('ReviewPage: My claimed items count:', myClaimedItems.length);

  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getMySubtotal = () => {
    return myClaimedItems.reduce((sum, item) => 
      sum + (item.price_cents * item.claimed_fraction), 0);
  };

  const handleTipSelect = (tip: number | 'custom') => {
    setSelectedTip(tip);
    if (tip !== 'custom') {
      setCustomTip('');
    }
  };

  const getCurrentTipCents = () => {
    if (selectedTip === 'custom') {
      const tipAmount = parseFloat(customTip) || 0;
      return Math.round(tipAmount * 100);
    }
    
    if (selectedTip === 0) {
      return 0;
    }
    
    if (typeof selectedTip === 'number') {
      return Math.round(getMySubtotal() * (selectedTip / 100));
    }
    
    return 0;
  };

  const getMyTax = () => {
    if (!currentCheck) return 0;
    const taxRate = currentCheck.totals.tax_cents / currentCheck.totals.subtotal_cents;
    return Math.round(getMySubtotal() * taxRate);
  };

  const getMyTotal = () => {
    return getMySubtotal() + getMyTax() + getCurrentTipCents();
  };

  const handleProceedToPayment = async () => {
    console.log('ReviewPage: Proceeding to payment...');
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('ReviewPage: Navigating to success page');
      navigate('/success');
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show error states instead of redirecting
  if (!session || !currentCheck) {
    console.log('ReviewPage: Missing session or check, showing error');
    return (
      <Layout>
        <div className="container-settlr py-16 text-center">
          <p className="text-[#B6BCC2] text-lg mb-6">
            {!session ? 'Session expired' : 'Loading check data...'}
          </p>
          <button
            onClick={() => {
              navigate('/split');
            }}
            className="btn-primary px-6 py-3"
          >
            Back to Bill
          </button>
        </div>
      </Layout>
    );
  }

  if (!myClaimedItems.length) {
    console.log('ReviewPage: No claimed items, showing error');
    return (
      <Layout>
        <div className="container-settlr py-6 md:py-8">
          <div className="text-center py-12">
            <p className="text-[#B6BCC2] mb-6">No items selected for payment</p>
            <button
              onClick={() => {
                navigate('/split');
              }}
              className="btn-primary px-6 py-3"
            >
              Go back to bill
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-settlr py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/split')}
            className="text-[#B6BCC2] hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-white">Review & Pay</h1>
          <div className="w-6" />
        </div>

        {/* Items Summary */}
        <div className="bg-[#1A1D21] rounded-lg p-4 mb-6">
          <h2 className="text-white font-medium mb-3">Your Items</h2>
          <div className="space-y-2">
            {myClaimedItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#B6BCC2]">
                  {item.name} {item.claimed_fraction < 1 && `(${Math.round(item.claimed_fraction * 100)}%)`}
                </span>
                <span className="text-white">
                  {formatCents(item.price_cents * item.claimed_fraction)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Selection */}
        <div className="bg-[#1A1D21] rounded-lg p-4 mb-6">
          <h2 className="text-white font-medium mb-3">Add Tip</h2>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[0, 15, 18, 20].map((tip) => (
              <button
                key={tip}
                onClick={() => handleTipSelect(tip)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  selectedTip === tip
                    ? 'bg-[#009B3A] text-white'
                    : 'bg-[#2A2D31] text-[#B6BCC2] hover:bg-[#3A3D41]'
                }`}
              >
                {tip}%
              </button>
            ))}
          </div>
          <button
            onClick={() => handleTipSelect('custom')}
            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
              selectedTip === 'custom'
                ? 'bg-[#009B3A] text-white'
                : 'bg-[#2A2D31] text-[#B6BCC2] hover:bg-[#3A3D41]'
            }`}
          >
            Custom Amount
          </button>
          
          {selectedTip === 'custom' && (
            <div className="mt-3">
              <input
                type="number"
                placeholder="Enter tip amount"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2D31] text-white rounded border border-[#3A3D41] focus:border-[#009B3A] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-[#1A1D21] rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#B6BCC2]">Subtotal</span>
              <span className="text-white">{formatCents(getMySubtotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B6BCC2]">Tax</span>
              <span className="text-white">{formatCents(getMyTax())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B6BCC2]">Tip</span>
              <span className="text-white">{formatCents(getCurrentTipCents())}</span>
            </div>
            <div className="border-t border-[#3A3D41] pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-white">Total</span>
                <span className="text-white">{formatCents(getMyTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={loading}
          className="w-full bg-[#009B3A] hover:bg-[#1FB544] disabled:bg-[#2A2D31] disabled:text-[#B6BCC2] text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : `Pay ${formatCents(getMyTotal())}`}
        </button>
      </div>
    </Layout>
  );
}