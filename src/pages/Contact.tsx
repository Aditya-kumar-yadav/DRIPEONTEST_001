import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Mail, Phone, MapPin, Send, MessageCircle, X } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      addToast("Please fill of all details to dispatch message.", "error");
      return;
    }
    if (!turnstileToken && import.meta.env.PROD) {
      addToast("Please complete the security check to proceed.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message, turnstileToken })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Failed to submit inquiry. Please try again.", "error");
      } else {
        addToast("Your inquiry has been relayed to the Store successfully. Admin will review this shortly.", "success");
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to connect to the Store message channels. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-5xl mx-auto min-h-screen">
      
      {/* Contact head layout */}
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-16 select-none animate-fade-in">
        <span className="text-xs font-medium tracking-widest text-red-600 uppercase">Concierge Desk</span>
        <h1 className="font-sans text-3xl sm:text-5xl text-gray-900 uppercase tracking-wider">
          Support & Fit Consulting
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
          Questions regarding size allocations, fabric tailoring schedules, or global shipping schedules? Reach our team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-left">
        
        {/* Support coordinates blocks (1st Half) */}
        <div className="space-y-8">
          <div>
            <h2 className="font-sans text-xl text-gray-900 uppercase tracking-wide">Studio Channels</h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">Operated Monday through Friday — 10:00 to 18:00 IST</p>
          </div>

          <div className="space-y-6">
            
            {/* Email card */}
            <div className="flex gap-4 p-5 border border-red-600/30 bg-white/40 backdrop-blur-md hover:border-red-600/80 hover:bg-white/60 hover:shadow-[0_4px_30px_rgba(220,38,38,0.15)] rounded-xl transition-all duration-300">
              <Mail className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-gray-500 uppercase block">Inbox support</span>
                <a href="mailto:dripeonoutfit@gmail.com" className="text-xs font-medium text-gray-900 hover:text-red-600 underline uppercase">
                  dripeonoutfit@gmail.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-4 p-5 border border-red-600/30 bg-white/40 backdrop-blur-md hover:border-red-600/80 hover:bg-white/60 hover:shadow-[0_4px_30px_rgba(220,38,38,0.15)] rounded-xl transition-all duration-300">
              <MapPin className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="space-y-4 w-full">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-800 uppercase block tracking-wider">Store Location</span>
                  <p className="text-sm text-gray-900 uppercase tracking-widest font-semibold leading-relaxed">
                    Gandhi Nagar, near Shiv Mandir, beside Shambhu Dharamshala in Dhanbad, Jharkhand
                  </p>
                </div>
                
                <motion.div layoutId="map-container" className="w-full h-48 rounded-lg overflow-hidden shadow-inner border border-gray-200">
                  <iframe 
                    src="https://maps.google.com/maps?q=23.8121693,86.4578176&z=16&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, pointerEvents: 'none' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </motion.div>

                <button 
                  onClick={() => setIsMapExpanded(true)}
                  className="flex items-center justify-center gap-2 bg-[#1a73e8] text-white hover:bg-[#1557b0] px-6 py-3.5 text-sm font-bold tracking-widest uppercase transition-all rounded-md shadow-md hover:shadow-lg w-full mt-2"
                >
                  <MapPin className="w-4 h-4" />
                  Get directions on Google Maps
                </button>
              </div>
            </div>

            {/* Social contact details */}
            <div className="flex gap-4 p-5 border border-red-600/30 bg-white/40 backdrop-blur-md hover:border-red-600/80 hover:bg-white/60 hover:shadow-[0_4px_30px_rgba(220,38,38,0.15)] rounded-xl transition-all duration-300">
              <MessageCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-gray-500 uppercase block">Editorial Socials</span>
                <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed">
                  Join our verified Instagram stream{' '}
                  <a href="https://www.instagram.com/dripeon_?igsh=ZHVqenU1MnpscXRi" target="_blank" rel="noopener noreferrer" className="text-red-600 font-medium hover:underline">
                    @dripeon_
                  </a>{' '}
                  for live fit previews.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Ink Inquiry Form (2nd Half) */}
        <div className="bg-white/40 backdrop-blur-md border border-red-600/30 p-8 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] space-y-6 transition-all duration-300 hover:border-red-600/80 hover:shadow-[0_8px_32px_rgba(220,38,38,0.15)]">
          <div className="space-y-2 border-b border-gray-200 pb-4">
            <h3 className="font-serif font-black text-2xl text-gray-900 uppercase tracking-widest">Direct Consultation Form</h3>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Describe your sizing queries below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Your Name</label>
              <input
                type="text"
                placeholder="KRISHNA RAO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Email Inbox</label>
              <input
                type="email"
                placeholder="krish@outlook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-medium uppercase tracking-wider text-gray-500">Inquiry Details</label>
              <textarea
                rows={4}
                placeholder="DESCRIBE WEIGHT/HEIGHT TO ASSIST FIT RECOMMENDATION FOR TECHNICAL CARGOS..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-red-600 px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none uppercase"
                required
              />
            </div>

            <div className="flex justify-center w-full min-h-[65px] pt-2">
              <Turnstile
                siteKey={(import.meta as any).env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'light' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white hover:bg-gray-900 text-white font-semibold text-xs py-3 tracking-widest uppercase transition-colors rounded-sm cursor-pointer flex items-center justify-center gap-2 pt-2"
            >
              {loading ? "TRANSMITTING TO STUDIO..." : (
                <>
                  TRANSMIT ENQUIRY <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      <AnimatePresence>
        {isMapExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-12"
          >
            <motion.div 
              layoutId="map-container"
              className="relative w-full h-full max-w-6xl max-h-[800px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setIsMapExpanded(false)}
                className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
              
              <div className="flex-1 w-full h-full relative">
                <iframe 
                  src="https://maps.google.com/maps?q=23.8121693,86.4578176&z=17&output=embed" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=23.8121693,86.4578176"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#1a73e8] text-white hover:bg-[#1557b0] px-8 py-4 text-base font-black tracking-widest uppercase transition-all rounded-xl shadow-2xl hover:scale-105"
                  onClick={() => setIsMapExpanded(false)}
                >
                  <MapPin className="w-5 h-5 animate-bounce" />
                  Start Live Navigation
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
