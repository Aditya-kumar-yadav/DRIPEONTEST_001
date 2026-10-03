import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { X, Plus, Minus, Trash, Heart, ShoppingBag, ArrowRight, Tag, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Coupon } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getProductImageUrl } from '../utils/imageFallback';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQty, 
    removeFromCart, 
    cartSubtotal, 
    settings,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    apiFetch,
    addToast,
    checkedCartItemIds,
    setCheckedCartItemIds,
    addToWishlist,
    removeFromWishlist,
    wishlist,
    user
  } = useApp();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [showOffers, setShowOffers] = useState(false);
  const [fetchingOffers, setFetchingOffers] = useState(false);

  const fetchActiveCoupons = async () => {
    setFetchingOffers(true);
    try {
      const data = await apiFetch('/api/coupons/active');
      if (Array.isArray(data)) {
        setActiveCoupons(data);
      }
    } catch (err) {
      console.error("Failed to load active coupons in drawer", err);
    } finally {
      setFetchingOffers(false);
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      fetchActiveCoupons();
    }
  }, [isCartOpen]);

  // Lock body scroll when cart is open (Issue 2)
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isCartOpen]);

  // Free shipping math
  const freeShippingLimit = settings.freeShippingThreshold || 5000;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingLimit) * 100);
  const remainingForFreeShipping = freeShippingLimit - cartSubtotal;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
    setCouponCode('');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full sm:max-w-md flex sm:pl-10 h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 50, originX: 1, originY: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-full max-h-screen bg-white border-l border-gray-200 flex flex-col shadow-2xl overflow-hidden"
            >
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-sans tracking-wide text-gray-900">YOUR SHOPPING BAG</h2>
              <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-red-600 rounded">
                {cart.length}
              </span>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-900 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          {cart.length > 0 && (
            <div className="px-6 py-4 bg-gray-100/30 border-b border-gray-200 font-sans text-xs">
              {remainingForFreeShipping > 0 ? (
                <p className="text-gray-900 mb-2 leading-relaxed">
                  Add <span className="font-semibold text-red-600">₹{remainingForFreeShipping.toLocaleString('en-IN')}</span> more to unlock <span className="text-red-600 font-medium uppercase tracking-wider">Free Shipping</span>.
                </p>
              ) : (
                <p className="text-red-600 mb-2 font-medium tracking-wide">
                  ✓ Congratulations! You have unlocked complimentary shipping.
                </p>
              )}
              {/* Progress bar container */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full transition-all duration-500" 
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-6 px-6 space-y-6 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="w-12 h-12 text-brand-grey mb-4" />
                <p className="text-gray-900 font-sans text-lg tracking-wide mb-1">Your bag is empty.</p>
                <p className="text-gray-500 text-xs max-w-xs">Explore our latest Shackets, Gurkha and Japanese trousers to curate your editorial posture.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/');
                  }}
                  className="mt-6 px-6 py-3 border border-red-600 text-red-600 text-xs font-sans font-semibold tracking-widest hover:bg-red-600 hover:text-white transition-colors uppercase rounded"
                >
                  Shop the Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6 pb-2">
                {/* Master Checkbox Header inside Drawer */}
                <div className="flex items-center justify-between border-b border-gray-200/20 pb-3 mb-2 px-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={cart.length > 0 && checkedCartItemIds.length === cart.length}
                      onChange={() => {
                        const isAllChecked = cart.length > 0 && checkedCartItemIds.length === cart.length;
                        if (isAllChecked) {
                          setCheckedCartItemIds([]);
                        } else {
                          setCheckedCartItemIds(cart.map(item => item.id));
                        }
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-200 bg-white text-red-600 focus:ring-opacity-40 focus:ring-[#C9A96E] accent-[#C9A96E] cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
                      Select All ({checkedCartItemIds.length} / {cart.length})
                    </span>
                  </label>
                  {checkedCartItemIds.length === 0 && (
                    <span className="text-[9px] font-medium text-amber-500 uppercase tracking-widest animate-pulse">
                      Select 1 item to buy
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex gap-3 p-3 border rounded-2xl transition-all ${
                    checkedCartItemIds.includes(item.id) 
                      ? 'border-gray-200/60 bg-gray-50' 
                      : 'border-gray-200/20 bg-white opacity-90 grayscale-[20%]'
                  }`}
                >
                  {/* Item Specific Checkbox */}
                  <div className="flex items-center justify-center pl-0.5">
                    <input 
                      type="checkbox"
                      checked={checkedCartItemIds.includes(item.id)}
                      onChange={() => {
                        setCheckedCartItemIds(prev =>
                          prev.includes(item.id) 
                            ? prev.filter(id => id !== item.id) 
                            : [...prev, item.id]
                        );
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-200 bg-white text-red-600 focus:ring-opacity-40 focus:ring-[#C9A96E] accent-[#C9A96E] cursor-pointer"
                    />
                  </div>

                  <div className="w-20 h-24 bg-gray-100 text-xs flex-shrink-0 overflow-hidden relative rounded-lg">
                    <img 
                      src={getProductImageUrl(item.product)} 
                      alt={item.product?.name}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-sans tracking-wide text-gray-900 line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-[11px] font-sans text-gray-500 mt-1">
                        Color: <span className="text-gray-900">{item.variant?.color}</span> | Size: <span className="text-gray-900">{item.variant?.size}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-gray-200 rounded-sm bg-white">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 font-medium text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const maxStock = item.variant?.stockQuantity ?? 10;
                            if (item.quantity >= maxStock) {
                              addToast(`Only ${maxStock} items available in physical inventory.`, "info");
                            } else {
                              updateCartQty(item.id, item.quantity + 1);
                            }
                          }}
                          className={`px-2 py-1 transition-colors ${
                            item.variant && item.quantity >= item.variant.stockQuantity 
                              ? 'text-neutral-700 cursor-not-allowed' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title={item.variant && item.quantity >= item.variant.stockQuantity ? "Maximum stock limit reached" : "Increase quantity"}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Add to Wishlist */}
                      <button
                        onClick={async () => {
                          if (!item.product) return;
                          const inWishlist = wishlist?.some(w => w.productId === item.product.id);
                          if (inWishlist) {
                            await removeFromWishlist(item.product.id);
                          } else {
                            await addToWishlist(item.product.id);
                          }
                        }}
                        className={`transition-colors p-1 ${
                          wishlist?.some(w => w.productId === item.product?.id)
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-red-600'
                        }`}
                        title={wishlist?.some(w => w.productId === item.product?.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className="w-4 h-4" fill={wishlist?.some(w => w.productId === item.product?.id) ? "currentColor" : "none"} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between">
                    <span className="text-xs font-medium text-red-600">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500">
                      ₹{(item.product?.price || 0).toLocaleString('en-IN')} ea
                    </span>
                  </div>
                </div>
              ))}
              </div>

              {/* Voucher Application and discovery loaded inside scrolling list container */}
              <div className="pt-4 border-t border-gray-200/40 space-y-4">
                {/* Voucher Application */}
                {!appliedCoupon ? (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE (e.g. FIRST500)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-grow bg-white border border-gray-200 px-3 py-2 text-xs text-gray-900 uppercase font-medium rounded-sm focus:outline-none focus:border-red-600 placeholder-brand-muted"
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2 border border-red-600 bg-red-600/10 text-red-600 text-xs font-medium uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors rounded-sm"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-red-600/10 border border-red-600/30 px-3 py-2 rounded-sm text-xs">
                    <p className="font-medium text-red-600">
                      CODE: <strong>{appliedCoupon.code}</strong> (₹{discountAmount} Saved)
                    </p>
                    <button 
                      onClick={removeCoupon}
                      className="text-gray-500 hover:text-red-600 p-1 text-xs underline uppercase font-bold text-red-600/80"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Custom Coupon / Offers Discovery Panel */}
                {activeCoupons.length > 0 && (
                  <div className="border border-red-600/15 rounded-lg overflow-hidden bg-white/45 shadow-sm text-left">
                    <button
                      type="button"
                      onClick={() => setShowOffers(!showOffers)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs text-[#82a39a] hover:text-gray-900 bg-gray-100/15 transition-all cursor-pointer font-sans"
                    >
                      <span className="flex items-center gap-2 font-medium font-sans">
                        <Tag className="w-3.5 h-3.5 text-red-600" />
                        <span>Available Offers</span>
                        <span className="bg-red-600/20 text-red-600 text-[10px] font-medium px-1.5 py-0.5 rounded-sm shrink-0">
                          {activeCoupons.length}
                        </span>
                      </span>
                      {showOffers ? (
                        <ChevronUp className="w-3.5 h-3.5 text-red-600 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-red-600 transition-transform duration-200" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showOffers && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-red-600/10"
                        >
                          <div className="p-3.5 space-y-2.5 max-h-48 overflow-y-auto divide-y divide-brand-grey/45">
                            {activeCoupons.map((c, idx) => {
                              const isEligible = cartSubtotal >= c.minOrderValue;
                              const isThisApplied = appliedCoupon?.code === c.code;
                              const discountMessage = c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString('en-IN')} OFF`;
                              
                              return (
                                <div key={c.id} className={`flex items-center justify-between gap-3 text-xs pt-2.5 ${idx === 0 ? 'pt-0 border-none' : ''}`}>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium font-black text-gray-900 bg-gray-100/40 px-2 py-0.5 rounded border border-gray-200 text-[11px] tracking-wider uppercase select-all">
                                        {c.code}
                                      </span>
                                      <span className="text-red-600 font-bold font-sans text-[11px] flex items-center gap-0.5">
                                        <Sparkles className="w-3 h-3 animate-pulse text-red-600" />
                                        {discountMessage}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-sans font-medium">
                                      {c.minOrderValue > 0 ? (
                                        isEligible ? (
                                          <span className="text-emerald-400">✓ Eligible: Min spend met</span>
                                        ) : (
                                          <span className="text-red-600/60">
                                            Spend ₹{(c.minOrderValue - cartSubtotal).toLocaleString('en-IN')} more to unlock
                                          </span>
                                        )
                                      ) : (
                                        <span>No minimum spend required</span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isThisApplied || !isEligible || applying}
                                    onClick={async () => {
                                      setApplying(true);
                                      await applyCoupon(c.code);
                                      setApplying(false);
                                    }}
                                    className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider border cursor-pointer select-none transition-all duration-250 ${
                                      isThisApplied
                                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 font-bold'
                                        : !isEligible
                                        ? 'bg-white/30 border-gray-200/40 text-gray-500/40 cursor-not-allowed'
                                        : 'bg-red-600/10 border-red-600/30 text-red-600 hover:bg-red-600 hover:text-white'
                                    }`}
                                  >
                                    {isThisApplied ? 'Applied' : 'Apply'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Footer calculation section */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-100/10 px-6 py-6 space-y-4 flex-shrink-0">
              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-red-600">
                    <span>Promo Discount</span>
                    <span className="font-medium">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-gray-900">
                    {cartSubtotal >= freeShippingLimit ? 'COMPLIMENTARY' : `₹${settings.shippingRate ?? 150}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-sans tracking-wider text-gray-900 uppercase">Total</span>
                  <span className="text-base font-sans font-semibold text-red-600">
                    ₹{Math.max(0, cartSubtotal + (cartSubtotal >= freeShippingLimit ? 0 : (settings.shippingRate ?? 150)) - discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                disabled={checkedCartItemIds.length === 0}
                className="w-full bg-red-600 text-white text-white disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed py-4 text-xs font-sans font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors duration-300 flex items-center justify-center gap-2 rounded-sm mt-2"
              >
                PROCEED TO CHECKOUT
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
