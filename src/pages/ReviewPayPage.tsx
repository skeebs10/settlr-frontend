import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettlrStore } from '../store/settlr-store';
import { TipPills } from '../components/TipPills';
import { TotalsCard } from '../components/TotalsCard';
import { onPayRestaurant } from '../hooks/settlr-actions';

export function ReviewPayPage() {
  const navigate = useNavigate();
  const { 
    currentTab, 
    currentUserId, 
    getUserClaimedItems, 
    getUserClaimedTotal,
    tipAmount,
    setTipAmount
  } = useSettlrStore();
  
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(18);
  const [customTip, setCustomTip] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!currentTab) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-lg">No tab found</p>
          <button 
            onClick={() => navigate('/split')}
            className="btn-primary mt-4 px-6 py-3"
          >
            Back to Split
          </button>
        </div>
      </div>
    );
  }
  
  const claimedItems = getUserClaimedItems();
  const subtotal = getUserClaimedTotal();
  const tax = Math.round(subtotal * 0.1); // 10% tax
  
  const getCurrentTipAmount = () => {
    if (selectedTip === 'custom') {
      const value = parseFloat(customTip);
      if (isNaN(value)) return 0;
      return Math.round(value * 100); // Assuming custom is in dollars
    }
    
    if (typeof selectedTip === 'number') {
      return Math.round(subtotal * (selectedTip / 100));
    }
    
    return 0;
  };
  
  const currentTip = getCurrentTipAmount();
  const total = subtotal + tax + currentTip;
  
  const handleTipSelect = (tip: number | 'custom') => {
    setSelectedTip(tip);
    if (tip !== 'custom') {
      setCustomTip('');
      const tipAmount = typeof tip === 'number' ? Math.round(subtotal * (tip / 100)) : 0;
      setTipAmount(tipAmount);
    }
  };
  
  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    const tipAmount = parseFloat(value);
    if (!isNaN(tipAmount)) {
      setTipAmount(Math.round(tipAmount * 100));
    }
  };
  
  const handlePay = async () => {
    setLoading(true);
    
    try {
      await onPayRestaurant(currentUserId, total, { tip: currentTip, tax });
      navigate('/complete');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (claimedItems.length === 0) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="container-settlr py-16 text-center">
          <p className="text-text-secondary mb-6">No items selected for payment</p>
          <button
            onClick={() => navigate('/split')}
            className="btn-primary px-6 py-3"
          >
            Back to Split Bill
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary">
      <div className="container-settlr py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">
            Review & Pay
          </h1>
          <p className="text-text-secondary">
            Confirm your order and add tip
          </p>
        </div>
        
        {/* Your Items */}
        <div className="card-default mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Your Items</h3>
          <div className="space-y-3">
            {claimedItems.map((item, index) => {
              const userClaim = item.claims.find(claim => claim.participantId === currentUserId);
              return (
                <div key={item.id}>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-text-primary">{item.name}</span>
                      {userClaim && userClaim.amount < item.price && (
                        <span className="text-sm ml-2 text-text-muted">
                          ({Math.round((userClaim.amount / item.price) * 100)}%)
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-text-primary ml-4">
                      ${((userClaim?.amount || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  {index < claimedItems.length - 1 && (
                    <div className="border-t border-divider"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Add Tip */}
        <div className="card-default mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Add Tip</h3>
          
          <TipPills
            selectedTip={selectedTip}
            onTipSelect={handleTipSelect}
            customTip={customTip}
            onCustomTipChange={handleCustomTipChange}
            subtotal={subtotal}
          />
          
          <div className="text-center mt-4">
            <p className="text-text-secondary">
              Tip: <span className="font-medium text-brand-primary">
                ${(currentTip / 100).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Totals */}
        <TotalsCard
          subtotal={subtotal}
          tax={tax}
          tip={currentTip}
          total={total}
          className="mb-6"
        />
        
        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full btn-primary py-4 font-semibold focus-ring"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            'Confirm & Pay'
          )}
        </button>
      </div>
    </div>
  );
}