import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface TipPillsProps {
  selectedTip: number | 'custom' | null;
  onTipSelect: (tip: number | 'custom') => void;
  customTip: string;
  onCustomTipChange: (value: string) => void;
  subtotal: number;
}

export function TipPills({ 
  selectedTip, 
  onTipSelect, 
  customTip, 
  onCustomTipChange, 
  subtotal 
}: TipPillsProps) {
  const [customType, setCustomType] = useState<'$' | '%'>('%');
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const tipOptions = [18, 20, 25, 0];
  
  const getCustomTipAmount = () => {
    const value = parseFloat(customTip);
    if (isNaN(value)) return 0;
    
    if (customType === '$') {
      return Math.round(value * 100);
    } else {
      return Math.round(subtotal * (value / 100));
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Preset tip buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {tipOptions.map((tip) => (
          <button
            key={tip}
            onClick={() => onTipSelect(tip)}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center tap-feedback focus-ring ${
              selectedTip === tip 
                ? 'btn-primary' 
                : 'btn-outlined'
            }`}
          >
            {selectedTip === tip && <Check className="w-4 h-4 mr-2" />}
            {tip === 0 ? 'No Tip' : `${tip}%`}
          </button>
        ))}
        
        <button
          onClick={() => onTipSelect('custom')}
          className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center tap-feedback focus-ring ${
            selectedTip === 'custom' 
              ? 'btn-primary' 
              : 'btn-outlined'
          }`}
        >
          {selectedTip === 'custom' && <Check className="w-4 h-4 mr-2" />}
          Other
        </button>
      </div>
      
      {/* Custom tip input */}
      {selectedTip === 'custom' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex bg-card-emphasis rounded-lg p-1">
              <button
                onClick={() => setCustomType('%')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  customType === '%' 
                    ? 'bg-brand-primary text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setCustomType('$')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  customType === '$' 
                    ? 'bg-brand-primary text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                $
              </button>
            </div>
            
            <input
              type="number"
              value={customTip}
              onChange={(e) => onCustomTipChange(e.target.value)}
              placeholder={customType === '$' ? '0.00' : '0'}
              step={customType === '$' ? '0.01' : '1'}
              min="0"
              className="flex-1 bg-card-emphasis border border-border rounded-lg px-3 py-2 text-text-primary focus-ring"
            />
          </div>
          
          {customTip && (
            <p className="text-sm text-text-secondary">
              Tip amount: {formatCents(getCustomTipAmount())}
            </p>
          )}
        </div>
      )}
    </div>
  );
}