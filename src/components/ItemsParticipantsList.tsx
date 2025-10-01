import React, { useState } from 'react';
import { User, DollarSign, X } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';

interface Claim {
  participantId: string;
  participantName: string;
  type: 'full' | 'half' | 'custom';
  amount: number;
}

interface Item {
  id: string;
  name: string;
  price: number;
  claimedAmount: number;
  claims: Claim[];
}

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  owesToHost: number;
  status: 'paid' | 'pending';
}

interface ItemsParticipantsListProps {
  items: Item[];
  participants: Participant[];
  onMarkReceived: (participantId: string, amount: number) => Promise<void>;
}

export function ItemsParticipantsList({
  items,
  participants,
  onMarkReceived
}: ItemsParticipantsListProps) {
  const [markReceivedModal, setMarkReceivedModal] = useState<{
    participantId: string;
    participantName: string;
    amount: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getClaimBadge = (claim: Claim) => {
    const initials = getParticipantInitials(claim.participantName);
    let label = '';
    
    if (claim.type === 'full') label = 'Full';
    else if (claim.type === 'half') label = 'Half';
    else label = formatCents(claim.amount);

    return (
      <span key={claim.participantId} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-900/20 text-green-400 rounded-full mr-2 mb-1">
        {initials}: {label}
      </span>
    );
  };

  const handleMarkReceived = async () => {
    if (!markReceivedModal) return;
    
    const amount = parseFloat(markReceivedModal.amount);
    if (isNaN(amount) || amount <= 0) return;

    setLoading(true);
    try {
      await onMarkReceived(markReceivedModal.participantId, Math.round(amount * 100));
      setMarkReceivedModal(null);
    } catch (error) {
      console.error('Mark received failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Items Section */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border-b border-gray-800 last:border-b-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{item.name}</h4>
                <span className="font-semibold text-white">{formatCents(item.price)}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <ProgressBar current={item.claimedAmount} total={item.price} />
              </div>
              
              {/* Remaining Badge */}
              {item.claimedAmount < item.price && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-900/20 text-yellow-400 rounded-full">
                    Remaining {formatCents(item.price - item.claimedAmount)}
                  </span>
                </div>
              )}
              
              {/* Claimed By */}
              {item.claims.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Claimed by:</p>
                  <div className="flex flex-wrap">
                    {item.claims.map(getClaimBadge)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Participants Section */}
      <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <span className="font-medium text-white">
                    {participant.name}
                    {participant.isHost && ' 👑'}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      participant.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {participant.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {participant.owesToHost > 0 ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Owes to host:</p>
                      <p className="font-semibold text-red-400">{formatCents(participant.owesToHost)}</p>
                    </div>
                    {!participant.isHost && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMarkReceivedModal({
                          participantId: participant.id,
                          participantName: participant.name,
                          amount: (participant.owesToHost / 100).toFixed(2)
                        })}
                        className="text-xs"
                      >
                        Mark Received
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-900/20 text-green-400 rounded-full">
                      Paid
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mark Received Modal */}
      {markReceivedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Mark Received</h3>
              <button
                onClick={() => setMarkReceivedModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  From {markReceivedModal.participantName}
                </p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={markReceivedModal.amount}
                    onChange={(e) => setMarkReceivedModal({
                      ...markReceivedModal,
                      amount: e.target.value
                    })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleMarkReceived}
                  loading={loading}
                  disabled={!markReceivedModal.amount || parseFloat(markReceivedModal.amount) <= 0}
                  className="flex-1"
                >
                  Confirm
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setMarkReceivedModal(null)}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}