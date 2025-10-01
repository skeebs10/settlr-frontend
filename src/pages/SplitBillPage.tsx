import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAppStore } from '../store';
import { MockServer } from '../lib/mock-server';
import { LineItem } from '../types';
import { ArrowLeft, Users, Receipt, MapPin, Menu, Share2, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple inline claim component to avoid navigation issues
function SimpleClaim({ item, onClaim }: { item: LineItem, onClaim: (fraction: number) => void }) {
  const [showOptions, setShowOptions] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const [customPercent, setCustomPercent] = React.useState('');
  
  const handleMainClick = () => {
    console.log('SimpleClaim: Main button clicked for item:', item.line_item_id);
    if (item.claimed_fraction === 0) {
      setShowOptions(true);
    } else {
      setShowOptions(true);
    }
  };
  
  const handleOptionClick = (fraction: number) => {
    console.log('SimpleClaim: Option clicked with fraction:', fraction);
    setShowOptions(false);
    setShowCustom(false);
    setCustomPercent('');
    onClaim(fraction);
  };
  
  const handleCustomClick = () => {
    setShowCustom(true);
    setShowOptions(false);
  };
  
  const handleCustomSubmit = () => {
    const percent = parseFloat(customPercent);
    if (percent >= 0 && percent <= 100) {
      console.log('SimpleClaim: Custom submit with percent:', percent);
      handleOptionClick(percent / 100);
    }
  };
  
  const handleCustomCancel = () => {
    setShowCustom(false);
    setCustomPercent('');
    setShowOptions(true);
  };
  
  // Custom input state
  if (showCustom) {
    return (
      <div className="flex flex-col space-y-2 w-20">
        <input
          type="number"
          value={customPercent}
          onChange={(e) => setCustomPercent(e.target.value)}
          placeholder="0%"
          min="0"
          max="100"
          className="input-default w-full px-2 py-2 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          autoFocus
        />
        <button
          type="button"
          onClick={handleCustomSubmit}
          className="btn-primary w-full px-2 py-2 text-xs font-bold"
        >
          Apply
        </button>
      </div>
    );
  }
  
  if (showOptions) {
    return (
      <div className="flex flex-col space-y-2 w-20">
        <button
          type="button"
          onClick={() => handleOptionClick(1.0)}
          className="btn-primary px-2 py-2 text-xs font-bold"
        >
          Full
        </button>
        <button
          type="button"
          onClick={() => handleOptionClick(0.5)}
          className="btn-primary px-2 py-2 text-xs font-bold"
        >
          Half
        </button>
        <button
          type="button"
          onClick={handleCustomClick}
          className="btn-primary px-2 py-2 text-xs font-bold"
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => handleOptionClick(0)}
          className="btn-primary px-2 py-2 text-xs font-bold"
        >
          Unclaim
        </button>
      </div>
    );
  }
  
  return (
    <button
      type="button"
      onClick={handleMainClick}
      className={`px-3 py-2 text-xs font-bold border-2 transition-all duration-300 flex items-center justify-center space-x-1 ${
        item.claimed_fraction > 0 
          ? 'claimed-pill border-[#244D30]'
          : 'btn-outlined'
      }`}
      style={{
        borderRadius: item.claimed_fraction > 0 ? '20px' : '12px',
        minHeight: '44px',
        minWidth: '64px'
      }}
    >
      {item.claimed_fraction > 0 ? (
        <Check className="w-3 h-3" />
      ) : (
        <Plus className="w-3 h-3" />
      )}
      <span className="text-xs">
        {item.claimed_fraction === 0 ? "Claim" :
         item.claimed_fraction === 0.5 ? "Half" :
         item.claimed_fraction === 1.0 ? "Full" :
         `${Math.round(item.claimed_fraction * 100)}%`}
      </span>
    </button>
  );
}

export function SplitBillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const {
    session,
    currentCheck,
    setCurrentCheck,
    updateItemClaim,
    getMyClaimedItems,
    getMySubtotal
  } = useAppStore();

  React.useEffect(() => {
    console.log('SplitBillPage: Component mounted');
    console.log('SplitBillPage: Session exists:', !!session);
    console.log('SplitBillPage: CurrentCheck exists:', !!currentCheck);
    
    if (!session) {
      console.log('SplitBillPage: No session found, staying on page with error');
      setLoading(false);
      return;
    }
    
    if (!currentCheck) {
      console.log('SplitBillPage: Loading check data...');
      const loadCheck = async () => {
        try {
          const check = await MockServer.getCheck(session.check_id);
          console.log('SplitBillPage: Check loaded successfully');
          setCurrentCheck(check);
          setLoading(false);
        } catch (error) {
          console.error('SplitBillPage: Failed to load check:', error);
          setLoading(false);
        }
      };
      loadCheck();
    } else {
      console.log('SplitBillPage: Check already exists, ready to render');
      setLoading(false);
    }
  }, [session, currentCheck, setCurrentCheck]);

  const restaurantData = {
    name: currentCheck?.venue || 'Tao',
    location: 'Downtown Chicago'
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleClaimChange = async (itemId: string, fraction: number) => {
    console.log('SplitBillPage: handleClaimChange called');
    console.log('SplitBillPage: Item ID:', itemId);
    console.log('SplitBillPage: Fraction:', fraction);
    
    if (!currentCheck || !session) {
      console.error('SplitBillPage: Missing currentCheck or session');
      return;
    }
    
    try {
      console.log('SplitBillPage: Updating item claim in store...');
      updateItemClaim(itemId, fraction);
      
      console.log('SplitBillPage: Calling MockServer...');
      await MockServer.updateClaim(currentCheck.check_id, itemId, session.session_id, fraction);
      
      console.log('SplitBillPage: Claim updated successfully');
      
      if (fraction > 0) {
        toast.success('Item claimed!', {
          duration: 1500,
          style: {
            background: '#1A1A1D',
            color: '#FFFFFF',
            borderRadius: '12px',
          }
        });
      }
    } catch (error) {
      console.error('SplitBillPage: Error updating claim:', error);
      toast.error('Failed to update claim');
    }
  };

  const handleShare = async () => {
    const shareLink = `${window.location.origin}/join?qr=demo_token`;
    
    try {
      await navigator.share({
        title: `Join our tab at ${restaurantData.name}`,
        text: 'Join our tab and split the bill!',
        url: shareLink
      });
    } catch (error) {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied!');
    }
  };

  const handleProceedToReview = () => {
    const myClaimedItems = getMyClaimedItems();
    console.log('SplitBillPage: Proceeding to review with items:', myClaimedItems.length);
    
    if (myClaimedItems.length === 0) {
      toast.error('Please claim at least one item');
      return;
    }
    
    console.log('SplitBillPage: Navigating to review page');
    navigate('/review');
  };

  const handleViewMenu = () => {
    window.open('https://taogroup.com/venues/tao-asian-bistro-chicago/menu/', '_blank');
  };

  // Show error if no session
  if (!session) {
    return (
      <Layout>
        <div className="container-settlr py-16 text-center">
          <p className="text-[#B6BCC2] text-lg mb-6">Session expired or not found</p>
          <button
            onClick={() => navigate('/join?qr=demo_token')}
            className="btn-primary px-6 py-3"
          >
            Join Tab
          </button>
        </div>
      </Layout>
    );
  }

  // Show loading
  if (loading) {
    return (
      <Layout>
        <div className="container-settlr py-16 text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#B6BCC2] text-lg">Loading bill...</p>
        </div>
      </Layout>
    );
  }

  // Show error if no check
  if (!currentCheck) {
    return (
      <Layout>
        <div className="container-settlr py-16 text-center">
          <p className="text-[#B6BCC2] text-lg mb-6">Failed to load bill data</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const myClaimedItems = getMyClaimedItems();
  const claimedCount = currentCheck.items.filter(item => item.claimed_fraction > 0).length;
  const totalItems = currentCheck.items.length;

  return (
    <Layout>
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
                <span className="text-xs md:text-sm">{restaurantData.location}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-2xl group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <Menu className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                <span className="text-sm md:text-base font-bold">View Menu</span>
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => navigate('/join?qr=demo_token')}
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
              <div className="text-right ml-4">
                <p className="text-xs md:text-sm text-[#8D949B]">
                  {claimedCount} of {totalItems} claimed
                </p>
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
                        <SimpleClaim 
                          item={item}
                          onClaim={(fraction) => handleClaimChange(item.line_item_id, fraction)}
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
            <div className="card-default claimed-border mb-8 md:mb-10">
              <h3 className="text-base md:text-lg font-bold text-white mb-4">Your Share</h3>
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
                  Table 12
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