import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Loader2, ArrowLeft, ShieldCheck, ShoppingCart, ShoppingBag, Eye, Trash2, Heart } from 'lucide-react';
import { useApp } from '../AppContext';
import { getProductImageUrl } from '../utils/imageFallback';

export default function Cart() {
  const { cart, cartSubtotal, updateCartQty, removeFromCart, addToast, checkedCartItemIds, setCheckedCartItemIds, addToWishlist, settings } = useApp();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentLog, setPaymentLog] = useState<string[]>([]);

  // Simulate premium client checkout sequence via axios mock endpoint
  const handleMockCheckout = async () => {
    if (cart.length === 0) {
      addToast("Your cart is empty. Please add items before checkout.", "error");
      return;
    }

    setIsProcessing(true);
    setPaymentLog(["[Handshake] Initiating secure mock gateway payload validation..."]);

    try {
      // Step 1: Simulate steps with log entries to make it extra dynamic and realistic for the client
      await new Promise(r => setTimeout(r, 600));
      setPaymentLog(prev => [...prev, "[Gateway] Creating transient token encryption envelope..."]);

      // Step 2: Trigger real API call to our /api/mock/checkout route via Axios
      const response = await axios.post('/api/mock/checkout', {
        amount: cartSubtotal,
        items: cart
          .filter(item => checkedCartItemIds.includes(item.id))
          .map(item => ({
            id: item.id,
            quantity: item.quantity,
            variantId: item.productVariantId,
          })),
        shippingAddress: {
          name: "Client Presentation Guest",
          street: "100 Luxury Way",
          city: "Metropolis",
          state: "NY",
          pincode: "10001"
        }
      });

      setPaymentLog(prev => [...prev, `[Settle] Received authorization verification block: ${response.data.orderId}`]);
      await new Promise(r => setTimeout(r, 850));

      setPaymentLog(prev => [...prev, "[Database] Synchronizing order ledger entries..."]);
      await new Promise(r => setTimeout(r, 500));

      // Global success Toast
      addToast(`Payment Authorized! Order generated: ${response.data.orderId}`, "success");

      // Redirect user to user accounts dashboard page
      navigate('/account');
    } catch (err: any) {
      console.error("[Mock checkout execution error]", err);
      addToast(err.response?.data?.error || "Transaction declined on secure handshake.", "error");
    } finally {
      setIsProcessing(false);
      setPaymentLog([]);
    }
  };

  return (
    <div className="flex-grow pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen font-sans w-full" id="mock-cart-view-container">
      {/* Design Header */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neutral-800 select-none text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
        <button onClick={() => navigate('/clothing')} className="hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Keep Exploring Codecs
        </button>
        <span>/</span>
        <span className="text-neutral-300">Bag & Interactive Gateway Simulator</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Cart Inventory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-sans tracking-tight text-neutral-100 flex items-center gap-2">
              <ShoppingBag className="text-red-600" size={22} />
              Presentation Bag
            </h1>
            <span className="text-xs font-medium text-neutral-500 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
              {cart.length} LINE ITEMS ACTIVE
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="border border-neutral-800/60 rounded-2xl bg-[#030303] p-12 text-center space-y-4">
              <div className="p-4 bg-neutral-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-neutral-800">
                <ShoppingCart className="text-red-600" size={24} />
              </div>
              <h2 className="text-md font-medium text-neutral-300 uppercase tracking-wider font-bold">Your Bag is Empty</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No luxury apparel looks associated with your current active browser session layout yet.
              </p>
              <button 
                onClick={() => navigate('/clothing')}
                className="mt-2 text-xs font-medium bg-red-600 text-white hover:bg-[#dbbc80] text-black font-bold uppercase py-3 px-6 rounded-lg transition-all"
              >
                Go to Collections
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Master Checkbox Header */}
              <div className="flex items-center justify-between bg-[#050505] border border-neutral-800 p-3 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
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
                    className="w-4 h-4 rounded border-neutral-700 bg-black text-red-600 focus:ring-opacity-40 focus:ring-[#C9A96E] accent-[#C9A96E] cursor-pointer"
                  />
                  <span className="text-xs font-medium font-bold text-neutral-300 uppercase tracking-widest">
                    Select All Items ({checkedCartItemIds.length} of {cart.length})
                  </span>
                </label>
                {checkedCartItemIds.length === 0 && (
                  <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider animate-pulse">
                    ⚠️ Choose at least 1 item to buy
                  </span>
                )}
              </div>

              {cart.map((item, index) => (
                <div 
                  key={item.id || index}
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#050505] border p-4 rounded-xl transition-all justify-between w-full ${
                    checkedCartItemIds.includes(item.id) ? 'border-neutral-700/60' : 'border-neutral-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Item Checkbox Toggle */}
                    <div className="flex items-center pl-1">
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
                        className="w-4.5 h-4.5 rounded border-neutral-700 bg-black text-red-600 focus:ring-opacity-40 focus:ring-[#C9A96E] accent-[#C9A96E] cursor-pointer"
                      />
                    </div>

                    <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={getProductImageUrl(item.product)} 
                        alt="Product visual" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-medium font-bold text-neutral-200 uppercase tracking-wide line-clamp-1">
                        {item.product?.name || "Premium Apparel Asset"}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-medium">
                        SIZE: {item.variant?.size || "M"} &nbsp;|&nbsp; COLOUR: {item.variant?.color || "N/A"}
                      </p>
                      <p className="text-xs text-red-600 font-medium font-bold">
                        ₹{(item.product?.price || 1200).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-neutral-900/60 pt-3 sm:pt-0">
                    <div className="flex items-center border border-neutral-800 bg-black rounded-lg">
                      <button 
                        onClick={() => updateCartQty(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1 text-xs text-neutral-500 hover:text-gray-900"
                        disabled={isProcessing}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs text-neutral-300 font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          const maxStock = item.variant?.stockQuantity ?? 10;
                          if (item.quantity >= maxStock) {
                            addToast(`Only ${maxStock} items available in physical inventory.`, "info");
                          } else {
                            updateCartQty(item.id, item.quantity + 1);
                          }
                        }}
                        className={`px-2.5 py-1 text-xs transition-all ${
                          item.variant && item.quantity >= item.variant.stockQuantity 
                            ? 'text-neutral-700 cursor-not-allowed bg-neutral-900/40' 
                            : 'text-neutral-500 hover:text-gray-900'
                        }`}
                        disabled={isProcessing}
                        title={item.variant && item.quantity >= item.variant.stockQuantity ? "Maximum stock limit reached" : "Increase quantity"}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="sm:hidden text-xs font-medium text-red-600 font-bold">
                        ₹{((item.product?.price || 1200) * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {/* Move to Wishlist */}
                      <button
                        onClick={async () => {
                          if (!item.product) return;
                          const success = await addToWishlist(item.product.id);
                          if (success) {
                            removeFromCart(item.id);
                          }
                        }}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                        disabled={isProcessing}
                        title="Move to wishlist"
                      >
                        <Heart size={14} />
                      </button>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                        disabled={isProcessing}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Secure Gate Checkout Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-neutral-800 bg-[#060606] rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-medium font-bold tracking-widest text-red-600 uppercase border-b border-neutral-900 pb-3 flex items-center gap-2">
              <CreditCard size={16} />
              Secure Checkout Gateway
            </h3>

            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Active Bag Subtotal:</span>
                <span className="text-neutral-200">${cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Estimated VAT / GST:</span>
                <span className="text-neutral-200">INCLUDED</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Shipping & Delivery:</span>
                <span className={cartSubtotal >= (settings.freeShippingThreshold ?? 5000) ? "text-green-500 font-bold uppercase" : ""}>
                  {cartSubtotal >= (settings.freeShippingThreshold ?? 5000) ? 'COMPLIMENTARY' : `?${settings.shippingRate ?? 150}`}
                </span>
              </div>
              <hr className="border-neutral-900" />
              <div className="flex justify-between items-center font-bold text-neutral-100 uppercase tracking-widest">
                <span>Order Total:</span>
                <span>${(cartSubtotal + (cartSubtotal >= (settings.freeShippingThreshold ?? 5000) ? 0 : (settings.shippingRate ?? 150))).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Simulated Live Payment Log Panel */}
            {isProcessing && paymentLog.length > 0 && (
              <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl space-y-1.5 font-medium text-[9px] text-red-600 select-none uppercase tracking-wider h-32 overflow-y-auto">
                {paymentLog.map((log, index) => (
                  <p key={index} className="animate-fade-in">{log}</p>
                ))}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-900 text-neutral-400">
                  <Loader2 size={10} className="animate-spin text-red-600" />
                  <span>Interactive Pipeline processing...</span>
                </div>
              </div>
            )}

            {/* Interactive Settle Action Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleMockCheckout}
                disabled={isProcessing || cart.length === 0 || checkedCartItemIds.length === 0}
                className={`w-full py-4 text-xs font-medium font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2
                  ${isProcessing || checkedCartItemIds.length === 0 
                    ? 'bg-neutral-900 text-neutral-500 border border-neutral-800' 
                    : 'bg-red-600 text-black hover:bg-[#dbbc80] active:scale-95'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-neutral-500" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    Proceed to Payment (${(cartSubtotal + (cartSubtotal >= (settings.freeShippingThreshold ?? 5000) ? 0 : (settings.shippingRate ?? 150))).toLocaleString('en-IN')})
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[9px] font-medium text-neutral-500 select-none">
                <ShieldCheck size={10} className="text-red-600" />
                <span>🔒 SECURE END-TO-END ENCRYPTED TRANSACTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
