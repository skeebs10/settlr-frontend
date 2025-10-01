import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Users } from 'lucide-react';

export function StaffFooterBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Pages where the footer should be hidden
  const hiddenPaths = ['/join', '/split', '/review', '/complete', '/tab/', '/success'];
  const shouldHide = hiddenPaths.some(path => location.pathname.includes(path));

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem('settlr_staff_footer_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after a brief delay with slide-up animation
    if (!shouldHide) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Analytics hook
        if (window.gtag) {
          window.gtag('event', 'staff_footer_shown');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldHide]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('settlr_staff_footer_dismissed', 'true');
    // Analytics hook
    if (window.gtag) {
      window.gtag('event', 'staff_footer_dismissed');
    }
  };

  const handleOpenDashboard = () => {
    navigate('/staff');
    // Analytics hook
    if (window.gtag) {
      window.gtag('event', 'staff_footer_cta_clicked', { cta: 'open_dashboard' });
    }
  };

  const handleLearnMore = () => {
    navigate('/staff/learn-more');
    // Analytics hook
    if (window.gtag) {
      window.gtag('event', 'staff_footer_cta_clicked', { cta: 'learn_more' });
    }
  };

  if (shouldHide || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-200 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        background: '#121214',
        borderTop: '2px solid #009B3A',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="py-3 md:py-4">
        <div className="container-settlr">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            {/* Left Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center mb-1">
                <Users className="w-4 h-4 mr-2 text-[#009B3A] flex-shrink-0" />
                <h3 className="text-white font-semibold text-sm md:text-base">
                  Restaurant Staff Tools
                </h3>
              </div>
              <p className="text-[#8D949B] text-xs md:text-sm">
                Manage tabs & payments in real time
              </p>
            </div>

            {/* Right Actions */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={handleOpenDashboard}
                aria-label="Open Staff Dashboard"
                className="btn-primary px-4 py-2 text-sm font-medium min-h-[44px] focus:outline-none focus:ring-4 focus:ring-[rgba(0,155,58,0.25)] hover:scale-102 transition-all duration-200"
              >
                Open Staff Dashboard
              </button>
              
              <button
                onClick={handleLearnMore}
                aria-label="Learn more about Staff Tools"
                className="btn-outlined px-4 py-2 text-sm font-medium min-h-[44px] focus:outline-none focus:ring-4 focus:ring-[rgba(0,155,58,0.25)] hover:border-[#009B3A] hover:text-white transition-all duration-200"
              >
                Learn More
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Hide staff tools bar"
              className="absolute top-2 right-2 md:relative md:top-0 md:right-0 p-2 text-[#8D949B] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[rgba(0,155,58,0.25)] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}