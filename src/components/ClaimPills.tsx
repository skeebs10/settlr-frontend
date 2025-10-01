import React, { useState } from 'react';
import { Item, ClaimType } from '../store/settlr-store';
import { onClaimItem, onRemoveClaim } from '../hooks/settlr-actions';
import { Check, Plus } from 'lucide-react';

interface ClaimPillsProps {
  item: Item;
  currentUserId: string;
  onComplete: () => void;
}

export function ClaimPills({ item, currentUserId, onComplete }: ClaimPillsProps) {
  const [loading, setLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customType, setCustomType] = useState<'$' | '%'>('$');
  const [customValue, setCustomValue] = useState('');
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const userClaim = item.claims.find(claim => claim.participantId === currentUserId);
  
  const handleClaim = async (type: ClaimType, payload?: { amount?: number; percent?: number }) => {
    setLoading(true);
    try {
      await onClaimItem(item.id, type, payload);
      onComplete();
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async () => {
    if (!userClaim) return;
    
    setLoading(true);
    try {
      await onRemoveClaim(userClaim.id);
      onComplete();
    } catch (error) {
      console.error('Remove claim failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCustomSubmit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const value = parseFloat(customValue);
    if (isNaN(value) || value <= 0) return;
    
    if (customType === '$') {
      const amountCents = Math.round(value * 100);
      if (amountCents > item.remainingAmount) return;
      handleClaim('CUSTOM_$', { amount: amountCents });
    } else {
      if (value > 100) return;
      handleClaim('CUSTOM_%', { percent: value });
    }
  };
  
  const getPreviewAmount = () => {
    const value = parseFloat(customValue);
    if (isNaN(value)) return 0;
    
    if (customType === '$') {
      return Math.min(Math.round(value * 100), item.remainingAmount);
    } else {
      return Math.min(Math.round(item.price * (value / 100)), item.remainingAmount);
    }
  };
  
  if (showCustom) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#121214] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setCustomType('$')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                customType === '$' 
                  ? 'bg-[#009B3A] text-white' 
                  : 'text-[#B6BCC2] hover:text-white'
              }`}
            >
              $
            </button>
            <button
              type="button"
              onClick={() => setCustomType('%')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                customType === '%' 
                  ? 'bg-[#009B3A] text-white' 
                  : 'text-[#B6BCC2] hover:text-white'
              }`}
            >
              %
            </button>
          </div>
          
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={customType === '$' ? '0.00' : '0'}
            step={customType === '$' ? '0.01' : '1'}
            min="0"
            max={customType === '$' ? (item.remainingAmount / 100).toFixed(2) : '100'}
            className="flex-1 input-default"
            autoFocus
          />
        </div>
        
        {customValue && (
          <p className="text-sm text-[#B6BCC2]">
            Preview: {formatCents(getPreviewAmount())}
          </p>
        )}
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customValue || getPreviewAmount() <= 0 || loading}
            className="btn-primary flex-1 py-2 text-sm font-medium"
          >
            {loading ? 'Claiming...' : 'Confirm'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustom(false);
              setCustomValue('');
            }}
            className="btn-outlined px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="w-16 md:w-20">
        {item.remainingAmount > 0 && (
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => handleClaim('FULL')}
              disabled={loading}
              className="btn-primary w-full px-2 py-2 text-xs font-bold tap-feedback"
            >
              Full
            </button>
            
            <button
              type="button"
              onClick={() => handleClaim('HALF')}
              disabled={loading}
              className="btn-primary w-full px-2 py-2 text-xs font-bold tap-feedback"
            >
              Half
            </button>
            
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              disabled={loading}
              className="btn-primary w-full px-2 py-2 text-xs font-bold tap-feedback"
            >
              Custom
            </button>
            
            {userClaim && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="btn-primary w-full px-2 py-2 text-xs font-bold tap-feedback"
              >
                Unclaim
              </button>
            )}
          </div>
        )}
        
        {!item.remainingAmount && userClaim && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="btn-primary w-full px-2 py-2 text-xs font-bold tap-feedback"
          >
            Unclaim
          </button>
        )}
        
        {!userClaim && (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            disabled={loading}
            className="btn-outlined px-2 md:px-3 py-2 text-xs font-bold border-2 transition-all duration-300 flex items-center justify-center space-x-1 tap-feedback"
            style={{
              borderRadius: '12px',
              minHeight: '44px',
              minWidth: '64px'
            }}
          >
            <Plus className="w-3 h-3" />
            <span className="text-xs">Claim</span>
          </button>
        )}
      </div>
    </div>
  );
}