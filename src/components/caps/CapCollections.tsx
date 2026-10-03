import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const collections = [
  {
    title: 'CLASSIC ESSENTIALS',
    desc: 'Timeless everyday styles.',
    img: '/images/collection-beanies.jpg', // Save the 4 beanies image here
    theme: 'bg-[#981414] text-white',
    arrowBg: 'bg-white',
    arrowColor: 'text-[#981414]',
  },
  {
    title: 'PREMIUM SERIES',
    desc: 'Elevated materials. Superior feel.',
    img: '/images/collection-alpha-club.jpg', // Save the grey cap with daisies here
    theme: 'bg-[#e5e5e5] text-gray-900',
    arrowBg: 'bg-white',
    arrowColor: 'text-gray-900',
  },
  {
    title: 'LIMITED EDITION',
    desc: 'Unique drops. Maximum impact.',
    img: '/images/collection-jack-jones.jpg', // Save the white JACK & JONES cap here
    theme: 'bg-[#800b0b] text-white',
    arrowBg: 'bg-white',
    arrowColor: 'text-[#800b0b]',
  }
];

export default function CapCollections() {
  const navigate = useNavigate();

  return (
    <section id="cap-collections" className="py-24 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/4 flex flex-col items-start justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-[#D90416] text-xs font-bold uppercase tracking-widest mb-4"
            >
              <span>EXPLORE</span>
              <div className="w-10 h-[1px] bg-[#D90416]"></div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-tight"
            >
              OUR COLLECTIONS
            </motion.h2>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                document.getElementById('cap-products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#b30012] text-white px-8 py-3.5 rounded-md font-bold tracking-widest text-xs hover:bg-red-800 transition-colors shadow-lg shadow-red-600/20 flex items-center gap-2 uppercase cursor-pointer"
            >
              VIEW ALL COLLECTIONS ↗
            </motion.button>
          </div>

          {/* Right Cards */}
          <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {collections.map((col, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onClick={() => {
                  document.getElementById('cap-products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-500 ease-out flex flex-col justify-between h-[320px] ${col.theme}`}
              >
                {/* Product Image */}
                <div className="absolute right-[-20%] bottom-[-10%] w-[120%] h-[120%] opacity-90 group-hover:scale-105 transition-transform duration-700 pointer-events-none flex items-end justify-end">
                  <img 
                    src={col.img} 
                    alt={col.title} 
                    className="w-[80%] h-[80%] object-contain object-bottom right-0 drop-shadow-2xl mix-blend-multiply"
                    onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       const parent = e.currentTarget.parentElement;
                       if (parent && !parent.querySelector('.fallback-msg')) {
                          const msg = document.createElement('div');
                          msg.className = 'fallback-msg absolute inset-0 bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-400 rounded-xl p-2 flex flex-col items-center justify-center text-center text-gray-600 shadow-lg';
                          const fileName = col.img.split('/').pop();
                          msg.innerHTML = `<span class="text-xs font-bold uppercase mb-1 text-black">Image Missing</span><p class="text-[10px] leading-tight">Save your image as<br/><b class="text-[#D90416]">${fileName}</b><br/>in public/images</p>`;
                          parent.appendChild(msg);
                       }
                    }}
                  />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-bold tracking-wider uppercase">{col.title}</h3>
                    <p className="mt-2 text-xs font-medium opacity-80 leading-relaxed">{col.desc}</p>
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
