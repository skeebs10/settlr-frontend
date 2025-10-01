import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { CustomerNudgeBanner } from '../components/CustomerNudgeBanner';
import { TabClosingBanner } from '../components/TabClosingBanner';
import { MockServer } from '../lib/mock-server';
import { useAppStore } from '../store';
import { Share2, Menu, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function JoinPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [nudgeBanner, setNudgeBanner] = useState<{
    isVisible: boolean;
    reason: 'unclaimed' | 'unpaid';
  }>({ isVisible: false, reason: 'unclaimed' });
  const [tabClosingBanner, setTabClosingBanner] = useState<{
    isVisible: boolean;
    type: 'closing' | 'reopened' | 'closed';
  }>({ isVisible: false, type: 'closing' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAppStore(state => state.setSession);

  const qrToken = searchParams.get('qr') || 'demo_token';

  const restaurantData = {
    name: 'Tao',
    location: 'Downtown Chicago',
    hasMenu: true
  };

  const handleJoin = async () => {
    if (loading) return; // Prevent double clicks
    
    setLoading(true);
    try {
      const session = await MockServer.joinSession(qrToken, name);
      
      // Set session in store
      setSession(session);
      
      // Also load the check data immediately
      const check = await MockServer.getCheck(session.check_id);
      useAppStore.getState().setCurrentCheck(check);
      
      setShareLink(session.share_link);
      
      toast.success('Joined tab successfully!', {
        duration: 2000,
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
      
      // Navigate to split page with a small delay to ensure state is set
      setTimeout(() => {
        navigate('/split', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('Join failed:', error);
      toast.error('Failed to join tab');
      setLoading(false);
    } finally {
      // Don't set loading to false here, let the timeout handle it
    }
  };

  const handleShare = async () => {
    const linkToShare = shareLink || `${window.location.origin}/tab/CHK_DEMO`;
    
    try {
      await navigator.share({
        title: 'Join our tab at Tao',
        text: 'Join our tab and split the bill!',
        url: linkToShare
      });
    } catch (error) {
      await navigator.clipboard.writeText(linkToShare);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleViewMenu = () => {
    window.open('https://taogroup.com/venues/tao-asian-bistro-chicago/menu/', '_blank');
  };

  return (
    <Layout>
      {/* Customer Banners */}
      <div className="container-settlr pt-6">
        <CustomerNudgeBanner
          isVisible={nudgeBanner.isVisible}
          reason={nudgeBanner.reason}
          venue={restaurantData.name}
          table="Table 12"
          unclaimedAmount={1200}
          unpaidAmount={850}
          onClaimItems={() => {
            setNudgeBanner(prev => ({ ...prev, isVisible: false }));
            navigate('/split');
          }}
          onPayNow={() => {
            setNudgeBanner(prev => ({ ...prev, isVisible: false }));
            navigate('/review');
          }}
          onDismiss={() => {
            setNudgeBanner(prev => ({ ...prev, isVisible: false }));
          }}
        />
        
        <TabClosingBanner
          isVisible={tabClosingBanner.isVisible}
          type={tabClosingBanner.type}
          onViewTab={() => {
            setTabClosingBanner(prev => ({ ...prev, isVisible: false }));
            navigate('/tab/demo');
          }}
          onViewReceipt={() => {
            setTabClosingBanner(prev => ({ ...prev, isVisible: false }));
            navigate('/tab/demo');
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
      </div>

      <div className="py-8 md:py-12">
        <div className="container-settlr">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">
              Join the Tab
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-[#B6BCC2]">
              You're about to join a tab at <span className="font-bold text-white">Tao</span>
            </p>
          </div>

          {/* Form */}
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm md:text-base font-medium text-white mb-3 label">
                Your name (optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-default w-full px-4 py-4 text-sm md:text-base"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full btn-primary mb-4 py-4 font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Joining...
                </div>
              ) : (
                'Join Tab'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A2F35]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black font-medium text-[#8D949B]">or</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="w-full btn-outlined mt-4 py-4 font-medium flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5 mr-3" />
              <span>Share with Friends</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 md:mt-12 text-center space-y-3 md:space-y-4 max-w-md mx-auto">
            <p className="text-xs md:text-sm text-center text-[#8D949B]">
              By joining, you agree to <span className="text-[#009B3A]">split the bill fairly</span>
            </p>
            <p className="text-xs md:text-sm text-center text-[#8D949B]">
              Share this tab with friends so they can join and split the bill
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}