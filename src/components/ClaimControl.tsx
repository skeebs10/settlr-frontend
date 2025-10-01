import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';

interface ClaimControlProps {
  fraction: number;
  onChange: (fraction: number) => void;
  disabled?: boolean;
}

export default function ClaimControl({ fraction, onChange, disabled = false }: ClaimControlProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customPercent, setCustomPercent] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    console.log('ClaimControl: Main button clicked, current fraction:', fraction);
    
    if (fraction === 0) {
      setShowOptions(true);
    } else {
      // If already claimed, show options to change or unclaim
      setShowOptions(true);
    }
  };

  const handleOptionClick = (e: React.MouseEvent, newFraction: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ClaimControl: Option clicked with fraction:', newFraction);
    
    try {
      onChange(newFraction);
      setShowOptions(false);
      setShowCustom(false);
      setCustomPercent('');
    } catch (error) {
      console.error('ClaimControl: Error in handleOptionClick:', error);
    }
  };

  const handleCustomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCustom(true);
    setShowOptions(false);
  };

  const handleCustomSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const percent = parseFloat(customPercent);
    if (percent >= 0 && percent <= 100) {
      console.log('ClaimControl: Custom submit with percent:', percent);
      onChange(percent / 100);
      setShowOptions(false);
      setShowCustom(false);
      setCustomPercent('');
    }
  };

  const handleCustomCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCustom(false);
    setCustomPercent('');
    setShowOptions(false);
  };

  const getClaimText = () => {
    if (!fraction || fraction === 0) return "Claim";
    if (fraction === 0.5) return "Half";
    if (fraction === 1.0) return "Full";
    return `${Math.round(fraction * 100)}%`;
  };

  // Custom input state
  if (showCustom) {
    return (
      <div className="w-16 md:w-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col space-y-2">
          <input
            type="number"
            value={customPercent}
            onChange={(e) => setCustomPercent(e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            className="input-default w-full px-2 py-2 text-xs text-center"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="btn-primary w-full px-2 py-2 text-xs font-bold"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleCustomCancel}
            className="btn-outlined w-full px-2 py-2 text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Options state
  if (showOptions) {
    return (
      <div className="w-16 md:w-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={(e) => handleOptionClick(e, 1.0)}
            disabled={disabled}
            className="btn-primary w-full px-2 py-2 text-xs font-bold"
          >
            Full
          </button>
          <button
            type="button"
            onClick={(e) => handleOptionClick(e, 0.5)}
            disabled={disabled}
            className="btn-primary w-full px-2 py-2 text-xs font-bold"
          >
            Half
          </button>
          <button
            type="button"
            onClick={handleCustomClick}
            disabled={disabled}
            className="btn-primary w-full px-2 py-2 text-xs font-bold"
          >
            Custom
          </button>
          {fraction > 0 && (
            <button
              type="button"
              onClick={(e) => handleOptionClick(e, 0)}
              disabled={disabled}
              className="btn-primary w-full px-2 py-2 text-xs font-bold"
            >
              Unclaim
            </button>
          )}
        </div>
      </div>
    );
  }

  // Main claim button
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`px-2 md:px-3 py-2 text-xs font-bold border-2 transition-all duration-300 flex items-center justify-center space-x-1 ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${
          fraction > 0 && !isNaN(fraction) 
            ? 'claimed-pill border-[#244D30]'
            : 'btn-outlined'
        }`}
        style={{
          borderRadius: fraction > 0 ? '20px' : '12px',
          minHeight: '44px',
          minWidth: '64px'
        }}
      >
        {fraction > 0 && !isNaN(fraction) ? (
          <Check className="w-3 h-3" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
        <span className="text-xs">{getClaimText()}</span>
      </button>
    </div>
  );
}