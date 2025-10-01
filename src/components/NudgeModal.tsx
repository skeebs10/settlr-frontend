import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { Button } from './Button';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (reason: 'unclaimed' | 'unpaid') => Promise<void>;
  unclaimedAmount: number;
  unpaidAmount: number;
  participantCount: number;
}

export function NudgeModal({
  isOpen,
  onClose,
  onSend,
  unclaimedAmount,
  unpaidAmount,
  participantCount
}: NudgeModalProps) {
  const [selectedReason, setSelectedReason] = useState<'unclaimed' | 'unpaid'>('unclaimed');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      // Default to unclaimed if there are unclaimed items, otherwise unpaid
      setSelectedReason(unclaimedAmount > 0 ? 'unclaimed' : 'unpaid');
    }
  }, [isOpen, unclaimedAmount]);

  const handleSend = async () => {
    setLoading(true);
    try {
      await onSend(selectedReason);
      setShowSuccess(true);
      setCooldown(30);
      
      // Auto-hide success banner after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to send nudge:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Send reminder</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-400 font-medium">
                Reminder sent to {participantCount} participant{participantCount !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}

        {/* Reason Selection */}
        <div className="space-y-4 mb-6">
          <p className="text-sm font-medium text-white">Reason:</p>
          
          <div className="space-y-3">
            {unclaimedAmount > 0 && (
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="unclaimed"
                  checked={selectedReason === 'unclaimed'}
                  onChange={(e) => setSelectedReason(e.target.value as 'unclaimed')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedReason === 'unclaimed' 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-600'
                }`}>
                  {selectedReason === 'unclaimed' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-white">Unclaimed items</span>
              </label>
            )}
            
            {unpaidAmount > 0 && (
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="unpaid"
                  checked={selectedReason === 'unpaid'}
                  onChange={(e) => setSelectedReason(e.target.value as 'unpaid')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedReason === 'unpaid' 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-600'
                }`}>
                  {selectedReason === 'unpaid' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-white">Unpaid balance</span>
              </label>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <p className="text-sm text-gray-400">
            Unclaimed {formatCents(unclaimedAmount)} • Unpaid {formatCents(unpaidAmount)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSend}
            loading={loading}
            disabled={cooldown > 0}
            className="flex-1"
          >
            {cooldown > 0 ? `Send again in ${cooldown}s` : 'Send Nudge'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}