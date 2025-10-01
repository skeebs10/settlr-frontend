import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettlrStore } from '../store/settlr-store';
import { SummaryBar } from '../components/SummaryBar';
import { onMarkReceived, onCloseTab, getPublicTabUrl } from '../hooks/settlr-actions';
import { Share2, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function ViewTabPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTab, currentUserId } = useSettlrStore();
  const [markReceivedAmount, setMarkReceivedAmount] = useState('');
  const [showMarkReceived, setShowMarkReceived] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  if (!currentTab || currentTab.id !== id) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-lg">Tab not found</p>
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
  
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const currentUser = currentTab.participants.find(p => p.id === currentUserId);
  const isHost = currentUser?.isHost || false;
  
  const canCloseTab = currentTab.totals.unclaimedTotal === 0 && currentTab.totals.unpaidToHost === 0;
  
  const handleMarkReceived = async (participantId: string) => {
    const amount = parseFloat(markReceivedAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setLoading(true);
    try {
      await onMarkReceived(participantId, Math.round(amount * 100));
      setShowMarkReceived(null);
      setMarkReceivedAmount('');
    } catch (error) {
      console.error('Mark received failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseTab = async () => {
    if (!canCloseTab) return;
    
    setLoading(true);
    try {
      await onCloseTab();
      navigate('/split');
    } catch (error) {
      console.error('Close tab failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to close tab');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    const shareUrl = getPublicTabUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join our tab at ${currentTab.venueName}`,
          text: 'Join our tab and split the bill!',
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Tab link copied to clipboard!');
    }
  };
  
  return (
    <div className="min-h-screen bg-primary">
      <SummaryBar />
      
      <div className="container-settlr py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">
            {currentTab.venueName} - {currentTab.tableName}
          </h1>
          <p className="text-text-secondary">
            Tab status: <span className="capitalize">{currentTab.status.replace('_', ' ')}</span>
          </p>
        </div>
        
        {/* Participants */}
        <div className="card-default mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Participants</h3>
          <div className="space-y-4">
            {currentTab.participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-text-primary">
                    {participant.displayName}
                    {participant.isHost && ' 👑'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    participant.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {participant.status === 'PAID' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {participant.owesToHost > 0 && (
                    <span className="text-sm text-text-secondary">
                      Owes {formatCents(participant.owesToHost)}
                    </span>
                  )}
                  
                  {isHost && participant.owesToHost > 0 && (
                    <button
                      onClick={() => setShowMarkReceived(participant.id)}
                      className="btn-outlined px-3 py-1 text-xs"
                    >
                      Mark Received
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mark Received Modal */}
        {showMarkReceived && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-default max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Mark Received</h3>
                <button
                  onClick={() => setShowMarkReceived(null)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Amount received
                  </label>
                  <input
                    type="number"
                    value={markReceivedAmount}
                    onChange={(e) => setMarkReceivedAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="input-default w-full"
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMarkReceived(showMarkReceived)}
                    disabled={!markReceivedAmount || loading}
                    className="btn-primary flex-1 py-2"
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowMarkReceived(null)}
                    className="btn-outlined px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Outstanding Panel */}
        {(currentTab.totals.unclaimedTotal > 0 || currentTab.totals.unpaidToHost > 0) && (
          <div className="card-emphasis mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Outstanding</h3>
            <div className="space-y-2">
              {currentTab.totals.unclaimedTotal > 0 && (
                <p className="text-yellow-400">
                  Unclaimed: {formatCents(currentTab.totals.unclaimedTotal)}
                </p>
              )}
              {currentTab.totals.unpaidToHost > 0 && (
                <p className="text-red-400">
                  Unpaid: {formatCents(currentTab.totals.unpaidToHost)}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="space-y-4">
          {isHost && (
            <button
              onClick={handleShare}
              className="w-full btn-outlined py-4 font-medium flex items-center justify-center focus-ring"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Tab
            </button>
          )}
          
          {isHost && currentTab.status === 'OPEN' && (
            <button
              onClick={handleCloseTab}
              disabled={!canCloseTab || loading}
              className="w-full btn-primary py-4 font-semibold focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canCloseTab ? 
                currentTab.totals.unclaimedTotal > 0 ? 
                  `Cannot close: ${formatCents(currentTab.totals.unclaimedTotal)} unclaimed` :
                  `Cannot close: ${formatCents(currentTab.totals.unpaidToHost)} unpaid`
                : undefined
              }
            >
              {loading ? 'Closing...' : 'Close Tab'}
            </button>
          )}
          
          {!canCloseTab && isHost && (
            <p className="text-sm text-text-muted text-center">
              {currentTab.totals.unclaimedTotal > 0 
                ? `Cannot close: ${formatCents(currentTab.totals.unclaimedTotal)} unclaimed`
                : `Cannot close: ${formatCents(currentTab.totals.unpaidToHost)} unpaid`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}