import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors, Sparkles, Feather } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState<'fit' | 'material' | 'mission'>('fit');

  return (
    <div className="flex-grow pt-32 pb-24 font-sans px-6 max-w-5xl mx-auto min-h-screen text-center space-y-16">
      
      {/* Intro Editorial Header */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-medium tracking-widest text-red-600 uppercase">The Innovation Chronicles</span>
        <h1 className="font-sans text-4xl sm:text-5xl text-gray-900 uppercase tracking-wider leading-tight">
          A New Era of Urban Streetwear Architecture
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
          Founded with a single cohesive vision: restructuring modern urban apparel to convey a bold, technical presence.
        </p>
      </div>

      {/* Large visual quote banner */}
      <div className="h-[400px] w-full rounded-lg relative overflow-hidden bg-white border border-gray-200/45 shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" 
          alt="Weavers looms threads" 
          className="w-full h-full object-cover opacity-60 scale-102 rounded-lg"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center p-8">
          <div className="max-w-xl text-center space-y-4 bg-white/75 backdrop-blur-md p-8 border border-gray-200/50 rounded-sm">
            <h3 className="font-sans italic text-lg text-red-600">"We refuse to conform to standard loose dimensions. True street culture demands technical precision with bold vertical lines."</h3>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">— DRIPEON manifesto</p>
          </div>
        </div>
      </div>

      {/* Structured core values tabs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left border-t border-gray-200 pt-12 items-start">
        
        {/* Value triggers (4 Cols) */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <h3 className="font-sans text-base text-gray-900 uppercase tracking-wider mb-2">Our Core Pillars</h3>
          
          <button
            onClick={() => setActiveTab('fit')}
            className={`px-4 py-3 text-left text-xs uppercase tracking-wider rounded border cursor-pointer transition-all ${
              activeTab === 'fit' 
                ? 'border-red-600 bg-red-600/10 text-red-600 font-bold' 
                : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
            }`}
          >
            01. Structural Fit Anatomy
          </button>

          <button
            onClick={() => setActiveTab('material')}
            className={`px-4 py-3 text-left text-xs uppercase tracking-wider rounded border cursor-pointer transition-all ${
              activeTab === 'material' 
                ? 'border-red-600 bg-red-600/10 text-red-600 font-bold' 
                : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
            }`}
          >
            02. Technical Fabrics
          </button>

          <button
            onClick={() => setActiveTab('mission')}
            className={`px-4 py-3 text-left text-xs uppercase tracking-wider rounded border cursor-pointer transition-all ${
              activeTab === 'mission' 
                ? 'border-red-600 bg-red-600/10 text-red-600 font-bold' 
                : 'border-gray-200/40 text-gray-500 hover:text-gray-900 hover:border-gray-900 bg-transparent'
            }`}
          >
            03. The Innovation Lab
          </button>
        </div>

        {/* Tab answers (8 Cols) */}
        <div className="md:col-span-8 bg-gray-100/10 border border-gray-200 p-8 rounded-sm min-h-[250px] flex flex-col justify-center space-y-4">
          {activeTab === 'fit' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="w-5 h-5 text-red-600" />
                <h4 className="font-sans text-lg text-gray-900 uppercase tracking-wider">FIT ARCHITECTURE</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-light">
                Our technical cargos feature articulated knees combined with an adjustable tactical waistband. Discarding conventional zipper systems, we secure garments with tailored internal buttons and military tabs, ensuring that the silhouette holds solid posture and straight alignment from hips to hem.
              </p>
            </>
          )}

          {activeTab === 'material' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Feather className="w-5 h-5 text-red-600" />
                <h4 className="font-sans text-lg text-gray-900 uppercase tracking-wider">HEAVYWEIGHT TECHNICAL WEAVE</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-light">
                Standard cotton wrinkles prematurely, and flimsy generic fabrics fail to hold lines. DRIPEON engineers proprietary synthetic blends, combining durable fibers with high-density twisting. The output is a heavyweight 340GSM fabric that creates beautiful natural form while remaining fully crease-resistant.
              </p>
            </>
          )}

          {activeTab === 'mission' && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <h4 className="font-sans text-lg text-gray-900 uppercase tracking-wider">GLOBAL INNOVATION LAB</h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-light">
                Every technical zipper, tactical strap, and hidden stitch is crafted inside our global innovation studios. We employ cutting-edge manufacturing techniques, preserving modern streetwear styles while paying comfortable living wages and providing clean, safe workspaces worldwide.
              </p>
            </>
          )}
        </div>

      </div>

      {/* CTA section links */}
      <div className="pt-8 border-t border-gray-200/40">
        <span className="text-xs font-medium text-red-600 uppercase block mb-4">CURATED READY-TO-WEAR SAMPLES</span>
        <Link 
          to="/clothing"
          className="inline-flex items-center gap-2.5 bg-red-600 text-white hover:bg-gray-900 text-white font-sans font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 border border-red-600 rounded-sm transition-all"
        >
          EXPLORE WORKSHOP CATALOG
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
