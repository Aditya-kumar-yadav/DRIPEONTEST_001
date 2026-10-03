import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function EarPiercing() {
  const navigate = useNavigate();
  const { addToast, settings } = useApp();
  const [isBookingOpen, setIsBookingOpen] = useState(true);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', piercingType: 'Lobe', phone: '', description: '' });
  const [loading, setLoading] = useState(false);

  const piercingTypes = ['Lobe', 'Helix', 'Tragus', 'Industrial', 'Daith', 'Conch'];
  const availableTimes = ['10:00 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

  // Calendar generation
  const today = new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      addToast('Please select a time slot.', 'error');
      return;
    }
    if (!formData.name || !formData.email) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Booking failed');
      }

      addToast('Booking confirmed.', 'success');
      const successData = {
        name: formData.name,
        phone: formData.phone,
        piercingType: formData.piercingType,
        date: selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: selectedTime,
      };
      setBookingSuccessData(successData);
      setFormData({ name: '', email: '', piercingType: 'Lobe', phone: '', description: '' });
      setSelectedTime(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to book appointment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formattedDayString = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.15, duration: 0.6, ease: "easeOut" as const }
    })
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <div className="bg-[#000000] text-white min-h-screen font-sans w-full overflow-x-hidden selection:bg-red-600 selection:text-white">

      {/* 1. HERO SECTION */}
      <section className="relative w-full h-screen min-h-[700px] flex items-center overflow-hidden bg-black">

        {/* Background Image of the Man (Right aligned) */}
        <div className="absolute inset-0 flex justify-end pointer-events-none">
          <div className="w-full md:w-[65%] h-full relative flex items-end justify-end pb-0 pr-0">
            <motion.img
              src="/hero_model_sticker.png"
              alt="Piercing Model"
              className="w-auto h-[90%] md:h-[95%] object-contain object-right-bottom opacity-100"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Soft gradient from left to ensure text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent w-[50%]"></div>
          </div>
        </div>

        {/* Top Centered Logo (Hidden on mobile to prevent overlapping with Navbar logo) */}
        <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 z-50">
          <h2 className="text-[#dc2626] font-bold tracking-[0.6em] text-xl uppercase">Dripeon</h2>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-16 flex h-full items-center">

          <motion.div
            className="flex flex-col justify-center w-full md:w-[60%] lg:w-[50%]"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-300">Bold By Choice</span>
            </motion.div>

            <h1 className="wordmark-font text-[6rem] md:text-[7.5rem] lg:text-[8.5rem] font-black leading-[0.85] tracking-tight uppercase">
              <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="text-[#f5f5f5] drop-shadow-2xl">Pierced.</motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="text-[#f5f5f5] drop-shadow-2xl">Personal.</motion.div>
              {/* Using a custom class for the script font, falling back to a cursive/brush style */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="text-[#dc2626] drop-shadow-2xl normal-case mt-0 -ml-2" style={{ fontFamily: "'Permanent Marker', 'Brush Script MT', cursive", letterSpacing: "0px", transform: "rotate(-3deg)" }}>
                POWERFUL.
              </motion.div>
            </h1>

            <motion.p custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-gray-300 text-sm font-light tracking-wide leading-relaxed">
              Premium Men's Piercings<br />Crafted for Your Identity.
            </motion.p>

            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mt-10">
              <button onClick={() => {
                setTimeout(() => {
                  document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }} className="bg-[#dc2626] text-white font-bold uppercase tracking-[0.15em] py-4 px-10 hover:bg-red-700 transition-colors text-[11px] flex items-center gap-3">
                Book A Session &rarr;
              </button>
            </motion.div>
          </motion.div>

          {/* Right side UI elements - Hidden since they are baked into the sticker image */}
          <div className="absolute right-6 lg:right-16 bottom-12 hidden gap-3 z-20">
            <button className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          {/* Vertical 01 / 05 decoration */}
          <div className="absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 text-[10px] font-bold text-gray-400 z-20">
            <span>01</span>
            <div className="w-px h-10 bg-gray-600"></div>
            <span>05</span>
          </div>

        </div>
      </section>

      {/* 2. SHOP BY PIERCING (Light/Grey Section) */}
      <section className="bg-[#f5f5f5] text-black py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-300 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-500">Express Your Edge</span>
                <div className="w-16 h-px bg-gray-400"></div>
              </div>
              <h2 className="wordmark-font text-5xl font-black uppercase tracking-tight">Shop By Piercing</h2>
            </div>
            <a href="#" className="text-xs font-bold tracking-[0.2em] uppercase hover:text-red-600 transition-colors mt-6 md:mt-0 flex items-center gap-2 group">
              View All <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { name: 'Lobe Piercings', img: settings?.piercingLobeImage || '/piercing_1.jpg' },
              { name: 'Helix Piercings', img: settings?.piercingHelixImage || '/piercing_2.jpg' },
              { name: 'Tragus Piercings', img: settings?.piercingTragusImage || '/piercing_3.jpg' },
              { name: 'Cartilage Piercings', img: settings?.piercingCartilageImage || '/piercing_4.jpg' }
            ].map((item, idx) => (
              <motion.div key={idx} onClick={() => {
                setTimeout(() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
              }} variants={fadeUp} className="group relative aspect-[3/4] overflow-hidden cursor-pointer bg-black">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-white text-xs font-bold tracking-[0.15em] uppercase">{item.name}</span>
                    <span className="text-white text-sm group-hover:text-red-500 group-hover:translate-x-2 transition-all duration-300">&rarr;</span>
                  </div>
                  <div className="w-0 h-[1px] bg-red-600 mt-3 group-hover:w-full transition-all duration-500"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* 4. BRAND / STYLE SECTION */}
      <section className="bg-black py-24 px-6 relative overflow-hidden border-t border-gray-900">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row border border-gray-900 bg-[#050505]">

          <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative overflow-hidden">
            <motion.img
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop"
              alt="Brand Lifestyle"
              className="w-full h-full object-cover grayscale brightness-[0.7] contrast-[1.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505] opacity-80 md:hidden"></div>
          </div>

          <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-500">More Than Jewelry</span>
                <div className="w-16 h-px bg-gray-700"></div>
              </div>

              <h2 className="wordmark-font text-5xl md:text-[4rem] font-black uppercase tracking-tight leading-[0.85] mb-8">
                <div className="text-white">Your Style.</div>
                <div className="text-[#dc2626] italic mt-3">Your Statement.</div>
              </h2>

              <p className="text-gray-400 text-sm md:text-base max-w-md font-light leading-relaxed mb-10 tracking-wide">
                At DRIPEON, we believe piercings are more than fashion—they're a form of self-expression. Designed for those who dare to be different.
              </p>

              <div>
                <button onClick={() => navigate('/about')} className="bg-transparent border border-gray-700 text-white font-bold uppercase tracking-[0.2em] py-4 px-8 hover:bg-white hover:text-black transition-colors text-xs flex items-center gap-3 group">
                  Discover Dripeon <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
            </motion.div>

            {/* Red Barcode Banner */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-[#dc2626] hidden md:flex flex-col items-center justify-between py-12 shadow-[-10px_0_30px_rgba(220,38,38,0.1)]">
              <div className="text-white text-xs font-black tracking-[0.4em] uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
                DRIPEON
              </div>
              <div className="flex gap-1 h-32 w-8 justify-center opacity-70">
                <div className="w-[1px] bg-white h-full"></div>
                <div className="w-[3px] bg-white h-full"></div>
                <div className="w-[1px] bg-white h-full"></div>
                <div className="w-[2px] bg-white h-full"></div>
                <div className="w-[4px] bg-white h-full"></div>
                <div className="w-[1px] bg-white h-full"></div>
                <div className="w-[2px] bg-white h-full"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. EXISTING SCHEDULING / BOOKING SYSTEM */}
      <AnimatePresence>
        {isBookingOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <section id="booking-section" className="py-32 px-6 flex justify-center bg-[#000000] relative z-20 border-t border-gray-900">
        <div className="max-w-[1200px] w-full flex flex-col items-center text-center mb-16">
          <h2 className="wordmark-font text-5xl font-black uppercase tracking-tight text-white mb-4">Book A Session</h2>
          <p className="text-gray-400 text-sm font-light tracking-widest uppercase">Secure your spot with our professional piercers</p>
          <div className="w-12 h-[2px] bg-red-600 mt-6"></div>
        </div>

        {bookingSuccessData ? (
          <div className="max-w-3xl w-full mx-auto bg-[#050505] border border-gray-900 p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600"></div>
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="wordmark-font text-3xl font-black uppercase text-white mb-2">Request Received</h3>
            <p className="text-gray-400 text-xs tracking-widest uppercase mb-10">Our team will contact you shortly to confirm your appointment.</p>
            
            <div className="bg-[#0a0a0a] border border-gray-800 p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-1">Client Name</p>
                <p className="text-sm text-white font-medium">{bookingSuccessData.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-1">Contact Number</p>
                <p className="text-sm text-white font-medium">{bookingSuccessData.phone}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-1">Piercing Type</p>
                <p className="text-sm text-white font-medium uppercase">{bookingSuccessData.piercingType}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-1">Date & Time</p>
                <p className="text-sm text-red-500 font-bold">{bookingSuccessData.date} at {bookingSuccessData.time}</p>
              </div>
            </div>

            <button onClick={() => {
              setBookingSuccessData(null);
            }} className="mt-10 bg-transparent border border-gray-700 text-white font-bold uppercase tracking-[0.2em] py-3 px-8 hover:bg-white hover:text-black transition-colors text-xs inline-flex items-center gap-3">
              Book Another Session
            </button>
          </div>
        ) : (
        <div className="max-w-5xl w-full mx-auto bg-[#050505] border border-gray-900 flex flex-col md:flex-row min-h-[500px] shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-700 ease-out z-10"></div>

          {/* LEFT PANEL */}
          <div className="w-full md:w-5/12 bg-[#0a0a0a] border-r border-gray-900 p-10 md:p-14 flex flex-col justify-between">
            <div>
              <div className="flex items-end gap-3 mb-2">
                <h2 className="wordmark-font text-7xl font-black tracking-tighter leading-none text-red-600">
                  {selectedDate.getDate()}
                </h2>
                <h3 className="text-xl font-bold tracking-[0.2em] uppercase text-white pb-1">
                  {formattedDayString}
                </h3>
              </div>
              <p className="mt-6 text-gray-500 font-light text-xs uppercase tracking-[0.1em] leading-relaxed">
                Schedule your exclusive ear-piercing session. Walk-ins are not guaranteed.
              </p>
            </div>

            <form onSubmit={handleBooking} className="mt-12 space-y-8">
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors uppercase text-sm tracking-widest"
                  placeholder="YOUR NAME"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors text-sm tracking-wider"
                  placeholder="YOUR EMAIL"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-2">Contact Number</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors uppercase text-sm tracking-widest"
                  placeholder="YOUR PHONE"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-2">Description / Notes</label>
                <textarea
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-white placeholder-gray-700 focus:outline-none focus:border-red-600 transition-colors text-sm tracking-wider resize-none h-16"
                  placeholder="ANY SPECIAL REQUESTS?"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div>
                <label className="block text-[9px] font-bold tracking-[0.25em] uppercase text-gray-500 mb-2">Piercing Type</label>
                <div className="flex flex-col gap-3">
                  <select
                    className="w-full bg-transparent border-b border-gray-800 py-2 text-white focus:outline-none focus:border-red-600 transition-colors uppercase text-sm tracking-widest cursor-pointer"
                    value={piercingTypes.includes(formData.piercingType) ? formData.piercingType : 'Other'}
                    onChange={e => {
                      if (e.target.value !== 'Other') {
                        setFormData({ ...formData, piercingType: e.target.value })
                      } else {
                        setFormData({ ...formData, piercingType: '' })
                      }
                    }}
                  >
                    {piercingTypes.map(type => (
                      <option key={type} value={type} className="bg-[#0a0a0a] text-white">
                        {type}
                      </option>
                    ))}
                    <option value="Other" className="bg-[#0a0a0a] text-white">Other (Custom)</option>
                  </select>
                  {!piercingTypes.includes(formData.piercingType) && (
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-gray-800 py-2 text-white focus:outline-none focus:border-red-600 transition-colors uppercase text-sm tracking-widest placeholder-gray-700"
                      placeholder="ENTER CUSTOM PIERCING"
                      value={formData.piercingType}
                      onChange={e => setFormData({ ...formData, piercingType: e.target.value })}
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-12 w-full bg-red-600 text-white font-bold uppercase tracking-[0.25em] py-5 flex items-center justify-between px-8 hover:bg-red-700 transition-colors disabled:opacity-70 text-xs group/btn"
              >
                <span>{loading ? 'BOOKING...' : 'BOOK APPOINTMENT'}</span>
                <span className="text-lg leading-none group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full md:w-7/12 bg-[#050505] p-10 md:p-14 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h2 className="wordmark-font text-xl font-bold text-white tracking-[0.2em] uppercase">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date(year, month - 1, 1))}
                  className="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition-colors"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date(year, month + 1, 1))}
                  className="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition-colors"
                >
                  &rarr;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-6 gap-x-2 flex-grow content-start">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dateNum = i + 1;
                const isSelected = dateNum === selectedDate.getDate();
                const isPast = new Date(year, month, dateNum) < new Date(new Date().setHours(0, 0, 0, 0));
                const hasAvailableSlots = !isPast && (dateNum % 3 !== 0);

                return (
                  <div key={dateNum} className="flex flex-col items-center justify-center relative h-10">
                    <button
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        setSelectedDate(new Date(year, month, dateNum));
                        setSelectedTime(null);
                      }}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all border ${isSelected
                          ? 'bg-red-600 text-white border-red-600'
                          : isPast
                            ? 'text-gray-800 border-transparent cursor-not-allowed'
                            : 'text-gray-400 border-transparent hover:border-gray-600 hover:text-white'
                        }`}
                    >
                      {dateNum}
                    </button>
                    {hasAvailableSlots && !isSelected && (
                      <div className="absolute -bottom-2 w-1.5 h-1.5 bg-red-600/50 rounded-none" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 border-t border-gray-900 pt-10">
              <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.25em] mb-6">Available Times</h4>
              <div className="flex flex-wrap gap-3 items-center">
                {selectedDate < new Date(new Date().setHours(0, 0, 0, 0)) ? (
                  <p className="text-xs text-gray-600 uppercase tracking-widest">No times available.</p>
                ) : (
                  <>
                    {availableTimes.map(time => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all border ${selectedTime === time
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-500 hover:text-white'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="OR ENTER TIME"
                      value={availableTimes.includes(selectedTime || '') ? '' : (selectedTime || '')}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="bg-transparent border-b border-gray-800 px-3 py-2 text-white text-xs uppercase tracking-widest placeholder-gray-700 focus:border-red-600 focus:outline-none ml-2 w-36"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </section>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
