import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { QrCode, Scan, Users, CreditCard, Smartphone, ArrowRight, Star, Clock, Shield, Lock, Receipt } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStaffDashboard = () => {
    navigate('/staff');
  };

  const handleTryDemo = async () => {
    setIsLoading(true);
    try {
      // Navigate directly without delay
      navigate('/join?qr=demo_token');
    } finally {
      // Don't set loading to false immediately to prevent double clicks
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <Layout>
      <div className="bg-black text-white min-h-screen">
        {/* HERO SECTION */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="container-settlr">
            {/* Logo/Header */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 tracking-tight">
                <span className="gradient-text font-semibold">Settlr</span>
              </h1>
              
              {/* Headline */}
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-2 md:mb-3">Split tabs instantly</h2>
              
              {/* Subheadline */}
              <p className="text-base md:text-lg lg:text-xl text-[#B6BCC2]">Fair, fast, and hassle-free</p>
            </div>

            {/* Hero Card */}
            <div className="mb-6 md:mb-8">
              <div className="card-default text-center">
                {/* QR/Scan Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Scan className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-lg md:text-xl font-medium text-white mb-2 md:mb-3 label">Ready to split?</h3>
                
                {/* Subtitle */}
                <p className="text-sm md:text-base mb-6 md:mb-8 text-[#B6BCC2]">Experience the future of bill splitting</p>
                
                {/* CTA Button */}
                <button
                  onClick={handleTryDemo}
                  disabled={isLoading}
                  className="group w-full md:w-auto btn-primary font-medium text-base md:text-lg px-6 py-4 flex items-center justify-center md:mx-auto"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    <>
                      Try Demo
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                {/* Feature chips */}
                <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  <div className="flex items-center px-3 py-2 rounded-full bg-white/5">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs md:text-sm text-[#B6BCC2]">Secure Payments</span>
                  </div>
                  <div className="flex items-center px-3 py-2 rounded-full bg-white/5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-xs md:text-sm text-[#B6BCC2]">Instant Split</span>
                  </div>
                  <div className="flex items-center px-3 py-2 rounded-full bg-white/5">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-xs md:text-sm text-[#B6BCC2]">5-Star Rated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW SETTLR WORKS */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="container-settlr">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">How <span className="gradient-text">Settlr</span> Works</h2>
              <p className="text-sm md:text-base text-[#8D949B]">Split any bill in 4 simple steps</p>
            </div>
            
            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                {
                  icon: QrCode,
                  title: "Scan QR Code",
                  description: "Simply scan the QR code at your table to join instantly",
                },
                {
                  icon: Users,
                  title: "Claim Your Items",
                  description: "Tap to claim what you ordered - split shared items easily",
                },
                {
                  icon: CreditCard,
                  title: "Add Tip & Pay",
                  description: "Choose your tip amount and pay securely with any method",
                },
                {
                  icon: Smartphone,
                  title: "Done!",
                  description: "Everyone pays their fair share - no awkward math",
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="card-default card-hover tap-feedback relative"
                >
                  {/* Step number badge */}
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#009B3A] flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">{index + 1}</span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center mb-3">
                      <step.icon className="w-6 h-6 mr-2 flex-shrink-0 text-[#009B3A]" />
                      <h3 className="text-base md:text-lg font-medium text-white label">{step.title}</h3>
                    </div>
                    <p className="text-sm md:text-base text-[#B6BCC2]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE SETTLR */}
        <section className="py-6 md:py-8 lg:py-12">
          <div className="container-settlr">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">Why Choose <span className="gradient-text">Settlr</span>?</h2>
              <p className="text-sm md:text-base text-[#8D949B]">The modern way to split restaurant bills</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                {
                  title: "Lightning Fast",
                  description: "Split bills in under 30 seconds",
                  icon: Clock
                },
                {
                  title: "Fair & Accurate",
                  description: "Everyone pays exactly what they ordered",
                  icon: Shield
                },
                {
                  title: "Secure Payments",
                  description: "Bank-level security with Stripe integration",
                  icon: Lock
                },
                {
                  title: "No App Required",
                  description: "Works instantly in any mobile browser",
                  icon: Smartphone
                },
                {
                  title: "Split Anything",
                  description: "Easily divide shared appetizers and drinks",
                  icon: Users
                },
                {
                  title: "Group Friendly",
                  description: "Perfect for dates, friends, and business meals",
                  icon: Star
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="card-default card-hover"
                >
                  <div className="flex items-start">
                    <feature.icon className="w-6 h-6 mr-3 md:mr-4 flex-shrink-0 text-[#009B3A]" />
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-white mb-1 md:mb-2 label">{feature.title}</h3>
                      <p className="text-sm md:text-base text-[#B6BCC2]">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-6 md:py-8 border-t border-[#2A2F35]">
          <div className="container-settlr text-center">
            <div className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-[#B6BCC2]">
                No more awkward bill splitting or cash calculations
              </p>
              
              <div className="pt-3 md:pt-4 border-t border-[#2A2F35]">
                <p className="text-xs md:text-sm text-[#8D949B]">
                  © 2025 Settlr. Making dining out better for everyone.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}