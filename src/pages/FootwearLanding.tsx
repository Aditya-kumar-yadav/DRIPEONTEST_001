import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import ShinyText from '../components/ShinyText';

export default function FootwearLanding() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Footwear Coming Soon | DRIPEON";
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-black/60 z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
        />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1920&q=80"
          alt="Dripeon Footwear Coming Soon"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 border border-white/20 bg-white/10 backdrop-blur-md text-white text-[10px] tracking-[0.3em] font-bold uppercase rounded-full">
              Phase II Initialization
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
            Footwear <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-lg">
              Coming Soon
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-300 font-medium max-w-xl mx-auto mb-12 uppercase tracking-widest leading-relaxed">
            We are engineering a new era of luxury footwear. Premium materials, avant-garde silhouettes, and uncompromising quality.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-md mx-auto"
        >
          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <Mail className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-widest">You're on the list. Expect greatness.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL FOR EARLY ACCESS"
                className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 px-6 py-4 rounded-xl text-xs uppercase tracking-widest font-bold focus:outline-none focus:border-red-600 focus:bg-white/10 transition-all shadow-[0_0_30px_rgba(220,38,38,0.1)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.2)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-red-600 text-white px-6 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                Notify Me <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
