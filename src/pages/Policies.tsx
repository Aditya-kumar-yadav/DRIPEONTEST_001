import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Ship, RefreshCw, Scale } from 'lucide-react';

type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms';

export default function Policies() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<PolicyType>('shipping');

  // Sync tab with pathname on load
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('shipping')) {
      setActiveTab('shipping');
    } else if (path.includes('return')) {
      setActiveTab('returns');
    } else if (path.includes('privacy')) {
      setActiveTab('privacy');
    } else if (path.includes('terms') || path.includes('conditions')) {
      setActiveTab('terms');
    }
  }, [location.pathname]);

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-4xl mx-auto min-h-screen text-left space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-gray-200 pb-5 space-y-2 select-none">
        <span className="text-xs font-medium text-red-600 uppercase tracking-widest">DRIPEON Regulations</span>
        <h1 className="font-sans text-3xl uppercase tracking-wider text-gray-900">Studio Policies</h1>
        <p className="text-xs text-gray-500 uppercase">Reviewed and updated: March 2026. Governing global transactions.</p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200/40 pb-4 select-none">
        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
            activeTab === 'shipping' 
              ? 'bg-red-600 text-white border-red-600 font-bold' 
              : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
          }`}
        >
          <Ship className="w-3.5 h-3.5" /> Shipping Policy
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
            activeTab === 'returns' 
              ? 'bg-red-600 text-white border-red-600 font-bold' 
              : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Returns & Exchanges
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
            activeTab === 'privacy' 
              ? 'bg-red-600 text-white border-red-600 font-bold' 
              : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Privacy Regulation
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
            activeTab === 'terms' 
              ? 'bg-red-600 text-white border-red-600 font-bold' 
              : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
          }`}
        >
          <Scale className="w-3.5 h-3.5" /> Terms of Service
        </button>
      </div>

      {/* Policy details render panels */}
      <div className="bg-gray-100/10 border border-gray-200 p-8 rounded-sm space-y-6 leading-relaxed font-sans text-xs text-gray-500 max-w-full overflow-hidden">
        
        {/* SHIPPING POLICY PANEL */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-fade-in uppercase tracking-wider font-light">
            <h2 className="font-sans text-lg text-gray-900 uppercase font-bold tracking-widest flex items-center gap-2">
              <Ship className="w-5 h-5 text-red-600" /> Shipping & Courier Protocols
            </h2>
            <p>
              At DRIPEON, we understand the fine line between anticipation and garment preservation. Every apparel item shipped under our brand undergoes careful steam pressing, sizing verification and is wrapped inside specialized heavy cardboard containers in our global distribution centers.
            </p>
            <div className="space-y-3 pl-4 border-l border-red-600">
              <p><strong>• Standard courier fees:</strong> Flat rate of ₹15 for orders below ₹200 threshold status worldwide.</p>
              <p><strong>• Complimentary delivery:</strong> Automatic activation for checkouts over ₹200 threshold.</p>
              <p><strong>• Packaging timeline:</strong> Requires 1–3 business days. Garments are engineered and inspected before boxing.</p>
              <p><strong>• Delivery Transit:</strong> Takes 3–7 business days to reach international hubs via express air carriage.</p>
            </div>
            <p>
              Following dispatch, tracking lines and manifest numbers will stream to your registered profile and inbox automatically.
            </p>
          </div>
        )}

        {/* RETURNS & EXCHANGES POLICY PANEL */}
        {activeTab === 'returns' && (
          <div className="space-y-6 animate-fade-in uppercase tracking-wider font-light">
            <h2 className="font-sans text-lg text-gray-900 uppercase font-bold tracking-widest flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-red-600" /> Returns, Replacements & Size Exchanges
            </h2>
            <p>
              We want DRIPEON draping contours to sit beautifully. If a silhouette's dimensions fail to meet expectations or require a minor inseam change, we support exchanges within 7 days from successful package delivery.
            </p>
            <div className="space-y-3 pl-4 border-l border-red-600">
              <p><strong>• eligibility:</strong> Articles must remain in pristine, unworn, unwashed conditions, completed with tags, side buckles and secondary wraps intact inside original shipping containers.</p>
              <p><strong>• Exchange request:</strong> Free. Submit an exchange request in your account portal. Our support team will dispatch courier pickups to carry the original and drop the swap.</p>
              <p><strong>• Returns / Refunds:</strong> Approved returns will receive shop credits or direct banking refunds minus standard bank processing overheads (approx 3%).</p>
            </div>
            <p>
              To file a claim, execute returns forms directly in your Account Dashboard, or mail our concierge at <strong>DRIPEON@gmail.com</strong> with order markers.
            </p>
          </div>
        )}

        {/* PRIVACY REGULATION POLICY PANEL */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-fade-in uppercase tracking-wider font-light text-[10px] leading-relaxed">
            <h2 className="font-sans text-lg text-gray-900 uppercase font-bold tracking-widest flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Privacy Policy
            </h2>
            <div className="space-y-4">
              <p className="font-bold">1. INFORMATION COLLECTION</p>
              <p>When you use the DRIPEON platform, we collect information you provide directly to us. This includes your name, email address, shipping address, payment information, and any other details you choose to provide during checkout or account registration.</p>
              
              <p className="font-bold">2. SECURITY & DATA PROTECTION</p>
              <p>DRIPEON treats collector privacy with strict posture. Our databases host profile settings, shipping credentials and past orders securely. Passwords are encrypted before writing, making credentials unreadable even to database administrators. We utilize industry-standard encryption protocols (SSL/TLS) for transmitting sensitive information.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Credentials Security:</strong> Encrypted using bcrypt hashing algorithms server-side.</li>
                <li><strong>Tokens Session:</strong> Authenticated using lightweight JSON Web Tokens (JWT) stored client-side in secure local scopes.</li>
                <li><strong>Financial Information:</strong> Card numbers, Razorpay credentials, and UPI information are processed directly by certified payment processors and NEVER stored on our servers.</li>
              </ul>

              <p className="font-bold">3. USAGE OF INFORMATION</p>
              <p>We use the information we collect to fulfill your orders, provide customer support, send administrative messages, and communicate with you about products, services, offers, and promotions offered by DRIPEON. We never disclose, rent, or lease collector email details to marketing agents without explicit consent.</p>

              <p className="font-bold">4. YOUR RIGHTS & CHOICES</p>
              <p>You may update, correct, or delete your account information at any time by logging into your account settings. For requests to expunge profile history or for privacy-related grievances, please contact our support team at <strong>legal@dripeon.com</strong>.</p>
            </div>
          </div>
        )}

        {/* TERMS OF SERVICE POLICY PANEL */}
        {activeTab === 'terms' && (
          <div className="space-y-6 animate-fade-in uppercase tracking-wider font-light text-[10px] leading-relaxed">
            <h2 className="font-sans text-lg text-gray-900 uppercase font-bold tracking-widest flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-red-600" /> Terms of Service
            </h2>
            <div className="space-y-4">
              <p className="font-bold">GENERAL TERMS OF SERVICE</p>
              <p>These Terms of Service are an agreement between DRIPEON Streetwear Pvt Ltd ("DRIPEON") and "You" (the users). This agreement outlines the general terms and conditions governing the use of the products and services made available by DRIPEON. Your use of our website constitutes acceptance of this Agreement. If you do not consent to these terms, you are not permitted to use or access the services.</p>
              
              <p className="font-bold">1. GENERAL RULES OF CONDUCT</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your use of DRIPEON’s website and services will comply with this TOS agreement along with all applicable local, state, national, and international laws.</li>
                <li>You are not allowed to collect any user content or personal information about any other user without their prior written consent.</li>
                <li>You must not host, display, upload, modify, publish, transmit, store, update, or share any information that violates any rules or guidelines of DRIPEON.</li>
                <li>You must certify that by purchasing any of our products from this website that you are 18 years or older.</li>
              </ul>

              <p className="font-bold">2. INTELLECTUAL PROPERTY & CREATIVE ASSETS</p>
              <p>Product names, category grids, exclusive garment designs, photography, media files, and branding elements are the private intellectual property of DRIPEON. You are not permitted to reproduce, distribute, or clone any portion of this website or its products without explicit permission.</p>

              <p className="font-bold">3. INVENTORY & PURCHASING LIMITS</p>
              <p>We hold the right to cap order volumes, reserve item options, or refuse service if fabric supplies dwindle or if transactions appear fraudulent. If any purchases or account actions appear suspicious, DRIPEON has the right to cancel associated orders and close relevant accounts linked to your name or email address.</p>

              <p className="font-bold">4. INDEMNIFICATION & LIMITATIONS TO LIABILITY</p>
              <p>To the maximum extent permitted by applicable law, you agree that you will not under any circumstances hold DRIPEON, its officers, directors, employees, or third-party service providers liable for any direct or indirect damages resulting from events beyond our control, shipping delays, or system malfunctions.</p>

              <p className="font-bold">5. DISPUTE RESOLUTION</p>
              <p>You agree that the competent courts shall have sole jurisdiction over all disputes relating to the execution and interpretation of this Agreement. These regulations are governed and construed under the legal jurisdictions worldwide where DRIPEON operates.</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
