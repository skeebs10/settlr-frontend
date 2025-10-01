import React, { useState, useEffect } from 'react';
import { Bell, Receipt, X } from 'lucide-react';
import { Button } from './Button';

interface CustomerNudgeBannerProps {
  isVisible: boolean;
  reason: 'unclaimed' | 'unpaid';
  venue: string;
  table: string;
  unclaimedAmount: number;
  unpaidAmount: number;
  onClaimItems: () => void;
  onPayNow: () => void;
  onDismiss: () => void;
}

export function CustomerNudgeBanner({
  isVisible,
  reason,
  venue,
  table,
  unclaimedAmount,
  unpaidAmount,
  onClaimItems,
  onPayNow,
  onDismiss
}: CustomerNudgeBannerProps) {
  const [shouldShow, setShouldShow] = useState(false);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  useEffect(() => {
    if (isVisible) {
      // Slide down animation
      const timer = setTimeout(() => setShouldShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setShouldShow(false);
    setTimeout(onDismiss, 200); // Wait for animation
  };

  if (!isVisible) return null;

  const title = reason === 'unclaimed' 
    ? "Quick reminder: claim your items."
    : "Almost there: finish your payment.";

  const icon = reason === 'unclaimed' ? Receipt : Bell;
  const IconComponent = icon;

  return (
    <div 
      className={`transition-all duration-200 ease-out ${
        shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      role="region"
      aria-live="polite"
    >
      <div className="bg-gray-800 border-2 border-green-500 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-green-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {venue} · {table} • Unclaimed {formatCents(unclaimedAmount)} • Unpaid {formatCents(unpaidAmount)}
              </p>
              
              {/* CTAs - Wrap on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onClaimItems}
                  className="w-full sm:w-auto"
                >
                  Claim Items
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onPayNow}
                  className="w-full sm:w-auto"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg ml-4 flex-shrink-0"
            aria-label="Dismiss reminder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}