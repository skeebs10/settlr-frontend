import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { CustomerNudgeBanner } from '../components/CustomerNudgeBanner';
import { TabClosingBanner } from '../components/TabClosingBanner';
import ClaimControl from '../components/ClaimControl';
import { useAppStore } from '../store';
import { MockServer } from '../lib/mock-server';
import { LineItem } from '../types';
import { ArrowLeft, Users, Receipt, MapPin, Menu, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function TabPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [nudgeBanner, setNudgeBanner] = useState<{
    isVisible: boolean;
    reason: 'unclaimed' | 'unpaid';
    dismissedAt?: number;
  }>({ isVisible: false, reason: 'unclaimed' });
  const [tabClosingBanner, setTabClosingBanner] = useState<{
    isVisible: boolean;
    type: 'closing' | 'reopened' | 'closed';
  }>({ isVisible: false, type: 'closing' });
  
  const {
    session,
    currentCheck,
    myClaimedItems,
    setCurrentCheck,
    updateItemClaim,
    getMySubtotal,
    getMyTotal
  } = useAppStore();

  const restaurantData = {
    name: currentCheck?.venue || 'Tao',
    location: 'Downtown Chicago'
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const fetchCheck = async () => {
    if (!checkId) return;
    
    try {
      const check = await MockServer.getCheck(checkId);
      setCurrentCheck(check);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load check');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('TabPage mounted, checkId:', checkId);
    console.log('Current session:', session);
    
    fetchCheck();
    const interval = setInterval(fetchCheck, 3000);
    return () => clearInterval(interval);
  }, [checkId, session]);

  const handleClaimChange = async (itemId: string, fraction: number) => {
    console.log('TabPage: handleClaimChange called', { itemId, fraction });
    console.log('TabPage: Current myClaimedItems before update:', myClaimedItems.length);
    
    // Prevent any navigation during claim processing
    if (claiming) return;
    
    if (!currentCheck) return;
    
    // Prevent any default browser behavior
    event?.preventDefault?.();
    event?.stopPropagation?.();
    
    // Update the UI immediately for better UX
    updateItemClaim(itemId, fraction);
    
    // Log the updated claimed items
    const updatedClaimedItems = useAppStore.getState().myClaimedItems;
    console.log('TabPage: Updated myClaimedItems after updateItemClaim:', updatedClaimedItems.length);
    
    try {
      setClaiming(itemId);
      await MockServer.updateClaim(currentCheck.check_id, itemId, session?.session_id || 'user_1', fraction);
      
      if (fraction > 0) {
        toast.success('Item claimed', {
          duration: 2500,
          style: {
            background: '#1A1A1D',
            color: '#FFFFFF',
            borderRadius: '12px',
            border: 'none'
          },
          iconTheme: {
            primary: '#009B3A',
            secondary: '#FFFFFF'
          }
        });
      } else {
        toast.success('Item unclaimed', {
          duration: 2500,
          style: {
            background: '#1A1A1D',
            color: '#FFFFFF',
            borderRadius: '12px',
            border: 'none'
          },
          iconTheme: {
            primary: '#009B3A',
            secondary: '#FFFFFF'
          }
        });
      }
    } catch (error) {
      console.error('TabPage: Error in handleClaimChange:', error);
      // Revert the change if the API call failed
      const originalItem = currentCheck.items.find(item => item.line_item_id === itemId);
      updateItemClaim(itemId, originalItem?.claimed_fraction || 0);
      toast.error('Failed to update claim');
    } finally {
      setClaiming(null);
    }
  };

  const handleShare = async () => {
    const shareLink = session?.share_link || `${window.location.origin}/join?qr=demo_token`;
    
    try {
      await navigator.share({
        title: `Join our tab at ${restaurantData.name}`,
        text: 'Join our tab and split the bill!',
        url: shareLink
      });
    } catch (error) {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleProceedToReview = () => {
    if (myClaimedItems.length === 0) {
      toast.error('Please claim at least one item');
      return;
    }
    navigate('/review');
  };

  const handleViewMenu = () => {
    window.open('https://taogroup.com/venues/tao-asian-bistro-chicago/menu/', '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!currentCheck) {
    return (
      <Layout>
        <div className="container-settlr py-16 text-center">
          <p className="text-[#B6BCC2] text-lg md:text-xl">Check not found</p>
          <button onClick={() => navigate('/join?qr=demo_token')} className="btn-primary mt-4 px-6 py-3">
            Join Tab
          </button>
        </div>
      </Layout>
    );
  }

  const claimedCount = currentCheck.items.filter(item => item.claimed_fraction > 0).length;
  const fullyClaimedCount = currentCheck.items.filter(item => item.claimed_fraction === 1).length;
  const totalItems = currentCheck.items.length;
  const allItemsClaimed = fullyClaimedCount === totalItems;

  return (
    <Layout>
      {/* Customer Nudge Banner */}
      <div className="container-settlr pt-6">
        <CustomerNudgeBanner
          isVisible={nudgeBanner.isVisible}
          reason={nudgeBanner.reason}
          venue={restaurantData.name}
          table="Table 12"
          unclaimedAmount={currentCheck?.items.reduce((sum, item) => 
            sum + (item.price_cents * (1 - item.claimed_fraction)), 0) || 0}
          unpaidAmount={0} // Mock - would come from backend
          onClaimItems={() => {
            setNudgeBanner(prev => ({ ...prev, isVisible: false }));
            // Auto-expand first unclaimed item logic would go here
          }}
          onPayNow={() => {
            setNudgeBanner(prev => ({ ...prev, isVisible: false }));
            navigate('/review');
          }}
          onDismiss={() => {
            setNudgeBanner(prev => ({ 
              ...prev, 
              isVisible: false, 
              dismissedAt: Date.now() 
            }));
          }}
        />
        
        {/* Tab Closing Banner */}
        <TabClosingBanner
          isVisible={tabClosingBanner.isVisible}
          type={tabClosingBanner.type}
          onViewTab={() => {
            setTabClosingBanner(prev => ({ ...prev, isVisible: false }));
            // Already on tab page
          }}
          onViewReceipt={() => {
            setTabClosingBanner(prev => ({ ...prev, isVisible: false }));
            navigate(`/tab/${checkId}`);
          }}
          onDismiss={() => {
            setTabClosingBanner(prev => ({ ...prev, isVisible: false }));
          }}
        />
      </div>

      {/* Restaurant Header */}
      <div className="relative overflow-hidden">
        <button
          onClick={handleViewMenu}
          className="group w-full focus:outline-none focus:ring-4 focus:ring-[#009B3A]/50 transition-all duration-300"
        >
          <div className="relative h-48 md:h-56 lg:h-64 w-full overflow-hidden">
            <img
              src="/image.png"
              alt={`${restaurantData.name}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 group-hover:from-black/50 group-hover:via-black/20 group-hover:to-black/10 transition-all duration-500"></div>
            
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 drop-shadow-2xl tracking-widest">{restaurantData.name}</h1>
              <div className="flex items-center text-white/90 mb-3 md:mb-4">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="text-sm md:text-base font-medium">{restaurantData.location}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-2xl group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Menu className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                <span className="text-sm md:text-base font-bold">View Menu</span>
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 p-2 md:p-3 bg-black/20 backdrop-blur-md text-white rounded-2xl hover:bg-black/30 transition-all duration-300 z-10 shadow-lg hover:shadow-xl transform hover:scale-110"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="py-6 md:py-8">
        <div className="container-settlr">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">Split the Bill</h2>
                <p className="text-sm md:text-base lg:text-lg text-[#B6BCC2]">Claim your items and we'll calculate your share</p>
              </div>
            </div>
            
            {/* Status Card */}
            <div className="card-default mb-4 md:mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <p className="text-sm md:text-base font-bold text-white">{session?.name || 'Guest'}</p>
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-500 text-white flex items-center justify-center">
                      {session?.is_host ? '👑 Host' : '👥 Guest'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg md:text-xl font-black text-white">Table 12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white">Bill Items</h3>
              </div>
              <div className="text-right">
                {allItemsClaimed ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs md:text-sm text-green-400 font-medium">
                      All items claimed ✓
                    </p>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-[#8D949B]">
                    {fullyClaimedCount} of {totalItems} claimed
                  </p>
                )}
              </div>
            </div>
            
            {currentCheck.items.map((item: LineItem) => (
              <div 
                key={item.line_item_id} 
                className={`card-default transition-all duration-300 ${
                  item.claimed_fraction > 0 
                    ? 'claimed-border' 
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-white pr-4 label">{item.name}</h3>
                      <p className="text-base md:text-lg font-semibold text-white flex-shrink-0 label">{formatCents(item.price_cents)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        {item.qty > 1 && (
                          <p className="text-xs md:text-sm mb-1 text-[#B6BCC2]">Quantity: {item.qty}</p>
                        )}
                        {item.claimed_fraction > 0 && (
                          <p className="text-xs md:text-sm text-[#009B3A]">
                            Your share: {formatCents(item.price_cents * item.claimed_fraction)}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <ClaimControl
                          fraction={item.claimed_fraction}
                          onChange={(fraction) => handleClaimChange(item.line_item_id, fraction)}
                          disabled={claiming === item.line_item_id}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State or My Total */}
          {myClaimedItems.length === 0 ? (
            <div className="card-emphasis mb-8 md:mb-10">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#2A2F35] flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Receipt className="w-6 h-6 md:w-8 md:h-8 text-[#8D949B]" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white mb-2">No items claimed yet</h3>
                <p className="text-xs md:text-sm text-[#8D949B]">
                  Start by claiming items above to see your total
                </p>
              </div>
            </div>
          ) : (
            <div className={`card-default ${allItemsClaimed ? 'bg-green-900/20 border-green-500' : 'claimed-border'} mb-8 md:mb-10`}>
              <h3 className="text-base md:text-lg font-bold text-white mb-4">Your Share</h3>
              {allItemsClaimed && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Ready to pay! All items have been claimed.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-[#B6BCC2]">Subtotal:</span>
                  <span className="font-bold text-white">{formatCents(getMySubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-[#B6BCC2]">Tax (estimated):</span>
                  <span className="font-bold text-white">
                    {formatCents(Math.round(getMySubtotal() * (currentCheck.totals.tax_cents / currentCheck.totals.subtotal_cents)))}
                  </span>
                </div>
                <div className="flex justify-between text-base md:text-lg font-bold pt-4 border-t-2 border-[#009B3A]">
                  <span className="text-white">Total (before tip):</span>
                  <span className="text-white">
                    {formatCents(getMySubtotal() + Math.round(getMySubtotal() * (currentCheck.totals.tax_cents / currentCheck.totals.subtotal_cents)))}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 md:space-y-4">
            <button
              type="button"
              onClick={handleProceedToReview}
              disabled={myClaimedItems.length === 0}
              className="w-full btn-primary py-4 font-bold"
            >
              Review & Pay
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-full btn-outlined py-4 font-bold flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span>Share</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 md:mt-8 text-center">
            <div className="card-default">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm mb-2 space-y-1 sm:space-y-0">
                <span className="flex items-center justify-center sm:justify-start text-[#8D949B]">
                  <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  {currentCheck.participants?.length || 1} {(currentCheck.participants?.length || 1) === 1 ? 'person' : 'people'} at table
                </span>
                <span className="text-[#8D949B]">
                  Bill total: {formatCents(currentCheck.totals.subtotal_cents)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#2A2F35]">
                <p className="text-xs text-[#FFB74D]">
                  ⚠️ Unclaimed items will be charged to the host
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}