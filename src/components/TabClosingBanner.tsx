import React, { useState, useEffect } from 'react';
import { Clock, Eye, Receipt } from 'lucide-react';
import { Button } from './Button';

interface TabClosingBannerProps {
  isVisible: boolean;
  type: 'closing' | 'reopened' | 'closed';
  onViewTab?: () => void;
  onViewReceipt?: () => void;
  onDismiss?: () => void;
}

export function TabClosingBanner({
  isVisible,
  type,
  onViewTab,
  onViewReceipt,
  onDismiss
}: TabClosingBannerProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (type === 'reopened' || type === 'closed') {
      // Auto-dismiss after 5 seconds for toast-like behavior
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [type, onDismiss]);

  if (!isVisible) return null;

  const getContent = () => {
    switch (type) {
      case 'closing':
        return {
          title: "Tab is closing — finishing up.",
          subtitle: "Staff can still make adjustments briefly.",
          icon: Clock,
          bgColor: "bg-yellow-900/20",
          borderColor: "border-yellow-500/30",
          iconColor: "text-yellow-400",
          cta: onViewTab ? (
            <Button size="sm" variant="secondary" onClick={onViewTab} className="w-full sm:w-auto">
              <Eye className="w-4 h-4 mr-2" />
              View Tab
            </Button>
          ) : null
        };
      
      case 'reopened':
        return {
          title: "Tab reopened for adjustments.",
          subtitle: "You can now claim items and make payments.",
          icon: Clock,
          bgColor: "bg-green-900/20",
          borderColor: "border-green-500/30",
          iconColor: "text-green-400",
          cta: null
        };
      
      case 'closed':
        return {
          title: "Tab closed",
          subtitle: "Thanks! You can still view your receipt.",
          icon: Receipt,
          bgColor: "bg-gray-800",
          borderColor: "border-gray-600",
          iconColor: "text-gray-400",
          cta: onViewReceipt ? (
            <Button size="sm" variant="secondary" onClick={onViewReceipt} className="w-full sm:w-auto">
              <Receipt className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          ) : null
        };
      
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  const { title, subtitle, icon: IconComponent, bgColor, borderColor, iconColor, cta } = content;

  return (
    <div 
      className={`transition-all duration-200 ease-out ${
        shouldShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      role="region"
      aria-live="polite"
    >
      <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-4 md:p-6 mb-6`}>
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0`}>
            <IconComponent className={`w-5 h-5 ${iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{subtitle}</p>
            
            {cta && (
              <div className="flex">
                {cta}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}