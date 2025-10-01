import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabDetailsHeader } from '../components/TabDetailsHeader';
import { NudgeModal } from '../components/NudgeModal';
import { ItemsParticipantsList } from '../components/ItemsParticipantsList';
import { GraceWindow } from '../components/GraceWindow';
import toast from 'react-hot-toast';

// Mock data - replace with actual API calls
const mockTabData = {
  id: 'tab_123',
  venue: 'TAO',
  table: 'Table 12',
  status: 'open' as const,
  items: [
    {
      id: 'item_1',
      name: 'Burger',
      price: 1500,
      claimedAmount: 1500,
      claims: [
        { participantId: 'user_1', participantName: 'Alex Smith', type: 'full' as const, amount: 1500 }
      ]
    },
    {
      id: 'item_2',
      name: 'Fries',
      price: 800,
      claimedAmount: 400,
      claims: [
        { participantId: 'user_2', participantName: 'Casey Jones', type: 'half' as const, amount: 400 }
      ]
    },
    {
      id: 'item_3',
      name: 'Drink',
      price: 500,
      claimedAmount: 0,
      claims: []
    }
  ],
  participants: [
    {
      id: 'user_1',
      name: 'Alex Smith',
      isHost: true,
      owesToHost: 0,
      status: 'paid' as const
    },
    {
      id: 'user_2',
      name: 'Casey Jones',
      isHost: false,
      owesToHost: 450,
      status: 'pending' as const
    }
  ]
};

export function StaffTabDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabData, setTabData] = useState(mockTabData);
  const [loading, setLoading] = useState<string | null>(null);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [graceWindow, setGraceWindow] = useState<{
    isActive: boolean;
    endTime: Date;
  }>({ isActive: false, endTime: new Date() });

  const claimedCount = tabData.items.filter(item => item.claimedAmount === item.price).length;
  const totalItems = tabData.items.length;
  const unclaimedAmount = tabData.items.reduce((sum, item) => sum + (item.price - item.claimedAmount), 0);
  const unpaidAmount = tabData.participants.reduce((sum, p) => sum + p.owesToHost, 0);
  const canClose = unclaimedAmount === 0 && unpaidAmount === 0;

  const handleNudge = () => {
    setShowNudgeModal(true);
  };

  const handleSendNudge = async (reason: 'unclaimed' | 'unpaid') => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Reminder sent to participants', {
      duration: 3000,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
      },
      iconTheme: {
        primary: '#009B3A',
        secondary: '#FFFFFF'
      }
    });
  };

  const handleCloseTab = async () => {
    if (!canClose) return;

    const confirmed = window.confirm('Close this tab? You can undo within 45s.');
    if (!confirmed) return;

    setLoading('close');
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start grace window
      const endTime = new Date(Date.now() + 45000); // 45 seconds
      setGraceWindow({ isActive: true, endTime });
      setTabData(prev => ({ ...prev, status: 'closed' }));
      
      toast.success('Tab closed. You have 45 seconds to undo.', {
        duration: 5000,
        style: {
          background: '#1A1A1D',
          color: '#FFFFFF',
          borderRadius: '12px',
        }
      });
    } catch (error) {
      toast.error('Failed to close tab');
    } finally {
      setLoading(null);
    }
  };

  const handleUndoClose = async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setGraceWindow({ isActive: false, endTime: new Date() });
    setTabData(prev => ({ ...prev, status: 'open' }));
    
    toast.success('Undo complete. Tab is now open.', {
      duration: 3000,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
      },
      iconTheme: {
        primary: '#009B3A',
        secondary: '#FFFFFF'
      }
    });
  };

  const handleGraceComplete = () => {
    setGraceWindow({ isActive: false, endTime: new Date() });
    toast.success('Tab closed permanently.', {
      duration: 3000,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
      }
    });
  };

  const handleRefresh = async () => {
    setLoading('refresh');
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, refetch data here
    } finally {
      setLoading(null);
    }
  };

  const handleMarkReceived = async (participantId: string, amount: number) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTabData(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId 
          ? { ...p, owesToHost: Math.max(0, p.owesToHost - amount), status: p.owesToHost <= amount ? 'paid' : 'pending' }
          : p
      )
    }));

    const participant = tabData.participants.find(p => p.id === participantId);
    toast.success(`Marked $${(amount / 100).toFixed(2)} received from ${participant?.name}`, {
      duration: 3000,
      style: {
        background: '#1A1A1D',
        color: '#FFFFFF',
        borderRadius: '12px',
      },
      iconTheme: {
        primary: '#009B3A',
        secondary: '#FFFFFF'
      }
    });
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/staff')}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {tabData.venue} - {tabData.table}
          </h1>
        </div>

        {/* Tab Details Header */}
        <TabDetailsHeader
          claimedCount={claimedCount}
          totalItems={totalItems}
          unclaimedAmount={unclaimedAmount}
          unpaidAmount={unpaidAmount}
          status={tabData.status}
          onNudge={handleNudge}
          onCloseTab={handleCloseTab}
          onRefresh={handleRefresh}
          canClose={canClose}
          loading={loading}
        />

        {/* Items and Participants */}
        <ItemsParticipantsList
          items={tabData.items}
          participants={tabData.participants}
          onMarkReceived={handleMarkReceived}
        />

        {/* Nudge Modal */}
        <NudgeModal
          isOpen={showNudgeModal}
          onClose={() => setShowNudgeModal(false)}
          onSend={handleSendNudge}
          unclaimedAmount={unclaimedAmount}
          unpaidAmount={unpaidAmount}
          participantCount={tabData.participants.length}
        />

        {/* Grace Window */}
        <GraceWindow
          isActive={graceWindow.isActive}
          endTime={graceWindow.endTime}
          onUndo={handleUndoClose}
          onComplete={handleGraceComplete}
        />
      </div>
    </div>
  );
}