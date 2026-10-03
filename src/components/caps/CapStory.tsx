import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function CapStory() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section className="py-32 bg-[#fafafa] text-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-6"
          >
            <h2 className="text-sm font-bold tracking-[0.3em] text-[#D90416]">WHY DRIPEON CAPS</h2>
            <h3 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">
              NOT AN ACCESSORY.<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #D90416' }}>A STATEMENT.</span>
            </h3>
            <p className="text-gray-700 text-lg max-w-md font-medium leading-relaxed">
              We approach our headwear with the same obsession as our tailored garments. 
              Structured brims, precise six-panel architecture, and premium heavy-gauge 
              embroidery ensure each cap stands alone as a foundational streetwear piece.
            </p>
          </motion.div>

          <div className="relative h-[600px] flex items-center justify-center">
            {/* Parallax Images */}
            <motion.div style={{ y: y1 }} className="absolute inset-0">
              <img 
                src="/images/cap-story-5-caps.png" 
                alt="Cap Construction" 
                className="w-full h-full object-cover object-center rounded-lg shadow-xl" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-msg')) {
                     const msg = document.createElement('div');
                     msg.className = 'fallback-msg bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-500 w-full h-full';
                     msg.innerHTML = '<span class="text-xl font-bold mb-2">Image Missing</span><p class="text-sm">Please save your 5 caps image as <b>cap-story-5-caps.png</b> in the <b>public/images</b> folder.</p>';
                     parent.appendChild(msg);
                  }
                }}
              />
            </motion.div>
            
            <motion.div style={{ y: y2 }} className="absolute -left-8 md:-left-16 bottom-[20%] z-10 p-6 md:p-8 bg-[#D90416] shadow-2xl text-left">
              <h4 className="text-3xl md:text-4xl font-black italic text-white leading-tight tracking-tighter">BUILT</h4>
              <h4 className="text-3xl md:text-4xl font-black italic text-black leading-tight tracking-tighter">DIFFERENT</h4>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
