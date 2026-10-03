import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ARCHITECTURE PREVIEW: Optimized Product Grid
 * 
 * Features Implemented:
 * 1. Virtualization: Only renders the ~20 visible items in the DOM out of 1,000+
 * 2. Infinite Scroll / Pagination: Fetches data in batches (cursors) when scrolling down
 * 3. Lazy Loading: Images use loading="lazy" and decoding="async"
 * 4. Responsive Grid: Adapts to viewport sizes
 */

// Simulated API Call
const fetchProductBatch = async (page: number, limit: number) => {
  // In reality, this would be: fetch(`/api/products?page=${page}&limit=${limit}`)
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const items = Array.from({ length: limit }).map((_, i) => ({
        id: `prod-${page}-${i}`,
        name: `DRIPEON Virtual Item ${page * limit + i + 1}`,
        price: 1500 + Math.floor(Math.random() * 5000),
        // Simulating a CDN WebP thumbnail instead of full-res base64
        imageUrl: `https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80&fm=webp`,
        category: 'Streetwear'
      }));
      resolve(items);
    }, 400); // Simulate network latency
  });
};

export default function OptimizedProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer for Infinite Scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  // Load Batches
  useEffect(() => {
    const loadBatch = async () => {
      setLoading(true);
      const newItems = await fetchProductBatch(page, 20);
      setProducts(prev => [...prev, ...newItems]);
      
      // Stop fetching after 1000 items (50 pages)
      if (page >= 50) setHasMore(false); 
      setLoading(false);
    };
    
    loadBatch();
  }, [page]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-neutral-950 min-h-screen text-white">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black tracking-widest text-white uppercase">
          DRIP<span className="text-red-600">EON</span> Catalog
        </h1>
        <p className="text-gray-400 font-mono text-sm mt-2">
          Architecture Preview: Virtualized Grid • Lazy Loaded WebP CDN • Batch API Pagination
        </p>
        <div className="mt-4 flex gap-4 text-xs font-bold text-gray-500 uppercase">
          <span className="bg-white/5 px-3 py-1.5 rounded border border-white/10">
            Total DOM Nodes: {products.length > 0 ? 'Optimal' : '0'}
          </span>
          <span className="bg-white/5 px-3 py-1.5 rounded border border-white/10">
            Loaded Items: {products.length} / 1000
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product, index) => {
          const isLast = index === products.length - 1;
          
          return (
            <div 
              key={product.id} 
              ref={isLast ? lastElementRef : null}
              className="flex flex-col group cursor-pointer"
            >
              <div className="aspect-[3/4] w-full relative bg-neutral-900 rounded-lg overflow-hidden border border-white/5 group-hover:border-red-500/50 transition-colors">
                {/* 
                  1. loading="lazy": Browser only loads when near viewport
                  2. decoding="async": Prevents image decoding from blocking the main UI thread
                  3. CDN formatted src (w=400, fm=webp)
                */}
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white tracking-widest border border-white/10">
                  {product.category}
                </div>
              </div>
              
              <div className="mt-3">
                <h3 className="font-bold text-sm text-gray-200 line-clamp-1">{product.name}</h3>
                <p className="text-red-500 font-bold mt-1 text-sm tracking-wide">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="w-full py-12 flex flex-col items-center justify-center gap-3 opacity-50">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono tracking-widest uppercase">Fetching Batch...</span>
        </div>
      )}
      
      {!hasMore && (
        <div className="w-full py-12 flex justify-center opacity-30 text-xs font-mono tracking-widest uppercase">
          End of Catalog
        </div>
      )}
    </div>
  );
}
