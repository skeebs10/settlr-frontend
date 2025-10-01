import React from 'react';
import { RefreshCw, MessageSquare, XCircle } from 'lucide-react';
import { Button } from './Button';

interface TabDetailsHeaderProps {
  claimedCount: number;
  totalItems: number;
  unclaimedAmount: number;
  unpaidAmount: number;
  status: 'open' | 'partially_paid' | 'closed';
  onNudge: () => void;
  onCloseTab: () => void;
  onRefresh: () => void;
  canClose: boolean;
  loading?: string | null;
}

export function TabDetailsHeader({
  claimedCount,
  totalItems,
  unclaimedAmount,
  unpaidAmount,
  status,
  onNudge,
  onCloseTab,
  onRefresh,
  canClose,
  loading
}: TabDetailsHeaderProps) {
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  const getStatusBadge = () => {
    const statusConfig = {
      open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
      partially_paid: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Paid' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.open;

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getCloseTooltip = () => {
    if (canClose) return undefined;
    
    const reasons = [];
    if (unclaimedAmount > 0) reasons.push(`${formatCents(unclaimedAmount)} unclaimed`);
    if (unpaidAmount > 0) reasons.push(`${formatCents(unpaidAmount)} unpaid`);
    
    return `Cannot close: ${reasons.join(' / ')}`;
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4 md:p-6 mb-6">
      {/* Summary Chips - Stack on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-400 font-medium">Claims</p>
          <p className="text-lg md:text-xl font-black text-white">{claimedCount} / {totalItems}</p>
        </div>
        
        {unclaimedAmount > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-400 font-medium">Unclaimed</p>
            <p className="text-lg md:text-xl font-black text-yellow-400">{formatCents(unclaimedAmount)}</p>
          </div>
        )}
        
        {unpaidAmount > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-400 font-medium">Unpaid</p>
            <p className="text-lg md:text-xl font-black text-red-400">{formatCents(unpaidAmount)}</p>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-gray-400 font-medium">Status</p>
          <div className="mt-1">
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Actions - Wrap on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={onNudge}
          loading={loading === 'nudge'}
          className="w-full sm:w-auto"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Nudge
        </Button>
        
        <div className="relative">
          <Button
            size="sm"
            variant="primary"
            onClick={onCloseTab}
            loading={loading === 'close'}
            disabled={!canClose}
            className="w-full sm:w-auto"
            title={getCloseTooltip()}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Close Tab
          </Button>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading === 'refresh'}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg border border-gray-700 hover:border-gray-600 min-h-[44px] w-full sm:w-auto flex items-center justify-center"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading === 'refresh' ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}