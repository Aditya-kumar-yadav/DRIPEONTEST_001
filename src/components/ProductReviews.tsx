import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare } from 'lucide-react';
import { Review } from '../types';
import { SafeImage } from './SafeImage';
import { useApp } from '../AppContext';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

// Muted brand gold color matching premium DRIPEON aesthetic
const BRAND_GOLD = "#C9A96E";

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state to track helpful clicks in current session to prevent double voting
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  const { user } = useApp();

  // Fetch reviews from persistent PostgreSQL database
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) {
        throw new Error('Could not fetch reviews from server');
      }
      const data = await res.json();
      setReviews(data);
      setError(null);
    } catch (err: any) {
      console.warn("Using placeholder luxury reviews. PostgreSQL reviews fetch failed:", err);
      setError(err.message || 'Standard database delay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Combine live DB reviews with high-trust fallbacks when DB reviews are empty
  const activeReviews = reviews;

  // Calculators conforming to Amazon-style specifications
  const totalReviewsCount = activeReviews.length;
  const averageRating = totalReviewsCount > 0 
    ? parseFloat((activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 5;

  // Star percentage distribution calculator (1 to 5)
  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  activeReviews.forEach(r => {
    const star = Math.min(Math.max(r.rating, 1), 5) as 1|2|3|4|5;
    starCounts[star]++;
  });

  const starPercentages = {
    5: totalReviewsCount > 0 ? Math.round((starCounts[5] / totalReviewsCount) * 100) : 0,
    4: totalReviewsCount > 0 ? Math.round((starCounts[4] / totalReviewsCount) * 100) : 0,
    3: totalReviewsCount > 0 ? Math.round((starCounts[2] / totalReviewsCount) * 100) : 0, // mapping 3 and 2 logically
    2: totalReviewsCount > 0 ? Math.round((starCounts[2] / totalReviewsCount) * 100) : 0,
    1: totalReviewsCount > 0 ? Math.round((starCounts[1] / totalReviewsCount) * 100) : 0,
  };

  // Adjust percentage sum anomalies for visual representation
  if (reviews.length === 0) {
    starPercentages[5] = 0;
    starPercentages[4] = 0;
    starPercentages[3] = 0;
    starPercentages[2] = 0;
    starPercentages[1] = 0;
  }

  // Handle upvoting helpful status
  const handleHelpfulClick = async (reviewId: string) => {
    if (votedHelpful[reviewId]) return;

    // Optimistically update frontend counter
    setVotedHelpful(prev => ({ ...prev, [reviewId]: true }));
    
    if (reviewId) {
      try {
        await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
        // Refresh silently
        const res = await fetch(`/api/products/${productId}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed marking helpful on database", err);
      }
    }
  };



  return (
    <div className="border-t border-red-600/15 mt-20 pt-16" id="product-reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-2xl font-sans font-medium tracking-wide text-gray-900" id="reviews-section-heading">
            Rating and reviews
          </h2>
          <p className="text-xs font-medium text-gray-900/40 uppercase tracking-widest mt-1">
            VERIFIED RATINGS FOR {productName}
          </p>
        </div>

        {/* 2-Column Grid Layout (Amazon Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: RATINGS SUMMARY CHART */}
          <div className="lg:col-span-4 bg-white border border-red-600/10 rounded-2xl p-6 sm:p-8" id="reviews-summary-card">
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl font-sans font-medium text-gray-900" id="average-rating-display">
                {averageRating}
              </span>
              <span className="text-sm font-medium text-gray-900/40">out of 5</span>
            </div>

            {/* Stars Display */}
            <div className="flex items-center gap-1.5 mb-2" id="avg-stars-container">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(averageRating);
                return (
                  <Star
                    key={star}
                    size={20}
                    className="transition-colors"
                    fill={filled ? BRAND_GOLD : 'none'}
                    color={filled ? BRAND_GOLD : 'rgba(201, 169, 110, 0.2)'}
                  />
                );
              })}
            </div>

            <p className="text-xs font-medium text-gray-900/60 mb-8" id="total-ratings-count">
              {totalReviewsCount} Rating and reviews
            </p>

            {/* Distribution Graph (Amazon Style Bars) */}
            <div className="space-y-4 mb-8" id="ratings-distribution-bars">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const percentage = starPercentages[stars];
                return (
                  <div key={stars} className="flex items-center text-xs font-medium text-gray-900/70 gap-3">
                    <span className="w-12 hover:underline cursor-pointer tracking-wider shrink-0">{stars} star</span>
                    
                    {/* Track */}
                    <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
                      {/* Active Indicator Fill bar */}
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: BRAND_GOLD
                        }}
                      />
                    </div>

                    <span className="w-8 text-right text-gray-900/40 font-medium shrink-0">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            </div>

          {/* RIGHT COLUMN: REVIEWS FEED */}
          <div className="lg:col-span-8 space-y-8" id="reviews-feed-column">
            {/* Individual Reviews Feed */}
            {loading && activeReviews.length === 0 ? (
              <div className="text-center py-12 border border-red-600/10 rounded-2xl bg-black/20" id="reviews-loader">
                <p className="font-medium text-xs text-gray-900/40 uppercase tracking-widest">
                  Loading persistent review models...
                </p>
              </div>
            ) : activeReviews.length === 0 ? (
              <div className="text-center py-16 border border-red-600/10 rounded-2xl bg-black/10" id="no-reviews-empty-state">
                <Star className="mx-auto text-[#C9A96E]/40 mb-3" size={32} />
                <p className="font-medium text-xs text-gray-900/40 uppercase tracking-widest">
                  No reviews yet. Be the first to review this after purchasing!
                </p>
              </div>
            ) : (
              <div className="space-y-6" id="reviews-feed-list">
                {activeReviews.map((rev) => {
                  const initial = rev.userName ? rev.userName.charAt(0).toUpperCase() : 'A';
                  return (
                    <div 
                      key={rev.id} 
                      className="border border-red-600/10 bg-black/10 rounded-2xl p-6 hover:border-red-600/20 transition-all duration-300"
                      id={`review-card-${rev.id}`}
                    >
                      {/* Customer Info Row */}
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        
                        {/* Left: Avatar + Name */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1a1a1a] border border-red-600/20 rounded-full flex items-center justify-center text-red-600 text-xs font-medium font-bold">
                            {initial}
                          </div>
                          <div>
                            <h5 className="text-sm font-sans font-medium text-gray-900">{rev.userName}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              {/* Stars */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    fill={star <= rev.rating ? BRAND_GOLD : 'none'}
                                    color={star <= rev.rating ? BRAND_GOLD : 'rgba(201, 169, 110, 0.2)'}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-900/30 text-[10px] font-medium">
                                • {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Verified Purchase Badge */}
                        {rev.verifiedPurchase && (
                          <div className="flex items-center gap-1 bg-red-600/5 text-red-600 text-[10px] font-medium py-1 px-2.5 rounded-full border border-red-600/10" id={`verified-${rev.id}`}>
                            <CheckCircle size={10} className="stroke-[2.5px]" />
                            <span className="tracking-wider uppercase">Verified purchase</span>
                          </div>
                        )}

                      </div>

                      {/* Review Content */}
                      <div className="pl-0 sm:pl-13">
                        {rev.title && (
                          <h6 className="text-[13px] font-sans font-medium text-gray-900 mb-2 leading-relaxed tracking-wider">
                            {rev.title}
                          </h6>
                        )}
                        <p className="text-xs text-gray-900/70 font-sans leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>

                        {/* If review has an attached photo, display it with luxury frame */}
                        {rev.imageUrl && (
                          <div className="mt-4 max-w-sm rounded-lg overflow-hidden border border-red-600/15 bg-black/45 hover:border-red-600/40 transition-colors duration-300">
                            <SafeImage 
                              src={rev.imageUrl} 
                              alt="Customer review attachment" 
                              className="max-h-72 w-full object-cover rounded-lg"
                              containerClassName="max-h-72"
                            />
                          </div>
                        )}

                        {/* Helpful Actions Footer */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-600/5">
                          <button
                            onClick={() => handleHelpfulClick(rev.id)}
                            disabled={votedHelpful[rev.id]}
                            className={`flex items-center gap-2 text-[10px] font-medium tracking-widest uppercase py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                              votedHelpful[rev.id]
                                ? 'bg-green-950/20 text-red-600 border-green-900/30'
                                : 'bg-transparent text-gray-900/40 hover:text-red-600 border-gray-900/10 hover:border-red-600/30'
                            }`}
                            id={`helpful-vote-btn-${rev.id}`}
                          >
                            <ThumbsUp size={11} className={votedHelpful[rev.id] ? 'fill-[#C9A96E]/20' : ''} />
                            <span>
                              {votedHelpful[rev.id] 
                                ? 'HELPFUL RECEIVED' 
                                : `HELPFUL (${rev.helpfulCount})`}
                            </span>
                          </button>

                          <span className="text-[10px] font-medium text-gray-900/20 uppercase tracking-widest flex items-center gap-1">
                            <MessageSquare size={10} /> Report Feedback
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
