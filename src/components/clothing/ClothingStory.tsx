import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import DriftWall from './DriftWall';

export default function ClothingStory() {
  const { globalProducts, isProductsLoaded } = useApp();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let fetchedImages: string[] = [];
    
    if (isProductsLoaded && globalProducts && globalProducts.length > 0) {
      fetchedImages = globalProducts
        .map((p: any) => p.images?.find((img: any) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl)
        .filter(Boolean);
    }

    if (fetchedImages.length === 0) {
      fetchedImages = [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
      ];
    }

    if (fetchedImages.length > 0) {
      let finalImages = fetchedImages.sort(() => 0.5 - Math.random());
      while (finalImages.length < 18) {
        finalImages = [...finalImages, ...finalImages];
      }
      setImages(finalImages.slice(0, 18));
    }
  }, [globalProducts, isProductsLoaded]);

  // Split images into 3 columns of 6
  const col1 = images.slice(0, 6);
  const col2 = images.slice(6, 12);
  return (
    <section className="bg-white w-full min-h-screen text-[#D90416] font-sans flex flex-col relative overflow-hidden">
      {/* Main Hero */}
      <div className="flex-grow flex flex-col-reverse md:flex-row w-full max-w-[1600px] mx-auto pt-16 md:pt-24">
        
        {/* Left Column - Image Grid */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-[calc(100vh-85px)] relative overflow-hidden p-4 md:p-0">
          
          {images.length > 0 && (
            <div className="w-full h-full">
              <DriftWall
                items={images.map((src, i) => ({ image: src, title: `DRIPEON Look ${i + 1}`, href: '#' }))}
                columns={4}
                tileWidth={160}
                tileHeight={240}
                gap={16}
                tilt={5}
                style={{}}
                turn={-4}
                perspective={1000}
                depth={100}
                speed={25}
                direction="up"
                dim={1}
                overlayColor="transparent"
                lift={0}
                grayscale={false}
                parallax={0.4}
                fade={0}
              />
            </div>
          )}

        </div>

        {/* Right Column - Text & CTA */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 text-left">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[#D90416]/60 text-xs font-bold tracking-[0.3em] uppercase">SCROLL</span>
            <div className="w-12 h-[1px] bg-[#D90416]/30"></div>
          </div>

          <div className="flex flex-col items-start mb-8 drop-shadow-sm">
            <h1 className="font-freak text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.95] tracking-wide uppercase">
              Premium<br />
              streetwear,<br />
              tailored fits and<br />
              more.
            </h1>
          </div>

          <p className="text-[#D90416]/80 text-base md:text-lg leading-relaxed max-w-md font-medium tracking-wide">
            Designed for the bold. Our curated collections bring cutting-edge fashion straight to your wardrobe. Discover pieces that redefine modern style and elevate your everyday look.
          </p>
        </div>

      </div>
    </section>
  );
}
